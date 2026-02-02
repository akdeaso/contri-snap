import * as cheerio from "cheerio";

export interface ParsedContributor {
  rank: number;
  name: string;
  avatar_url: string;
  posts: number;
  comments: number;
  reactions: number;
  badge:
    | "all-star contributor"
    | "top contributor"
    | "rising contributor"
    | null;
}

/**
 * Parse HTML outer string from Facebook Top Contributors
 * Structure: Each contributor is in an <a> tag with href to facebook.com profile
 */
export function parseHTML(htmlString: string): ParsedContributor[] {
  const $ = cheerio.load(htmlString);
  const contributors: ParsedContributor[] = [];

  // Find all contributor links - they have href to facebook.com profiles (not groups)
  const allLinks = $('a[href*="facebook.com"]').toArray();
  const contributorLinks: cheerio.Element[] = [];

  // Filter to only links that contain contributor cards (have rank numbers)
  allLinks.forEach((link) => {
    const $link = $(link);
    // Check if this link contains a rank number (1-10)
    const hasRank = $link
      .find('span[dir="auto"]')
      .toArray()
      .some((span) => {
        const text = $(span).text().trim();
        const num = parseInt(text);
        return num >= 1 && num <= 10;
      });

    // Also check if it has avatar (SVG with image)
    const hasAvatar =
      $link.find("svg image[xlink\\:href], svg image[href]").length > 0;

    if (hasRank && hasAvatar) {
      contributorLinks.push(link);
    }
  });

  contributorLinks.forEach((link) => {
    if (contributors.length >= 10) return;

    const $link = $(link);

    // simpan element rank yang bener biar bisa di-exclude tanpa ngilangin angka 1-10 yang valid
    let rankEl: cheerio.Element | null = null;

    // Extract rank - find span with dir="auto" containing only a number 1-10
    let rank = 0;
    const $rankSpans = $link.find('span[dir="auto"]');
    $rankSpans.each((_, el) => {
      const text = $(el).text().trim();
      const num = parseInt(text);
      if (num >= 1 && num <= 10 && text === num.toString()) {
        rank = num;
        rankEl = el;
        return false; // break
      }
    });

    if (rank === 0) return; // Skip if no valid rank

    // Extract avatar - look for image in SVG with xlink:href or href
    let avatar_url = "";
    const $svg = $link.find("svg").first();
    if ($svg.length > 0) {
      const $image = $svg.find("image").first();
      if ($image.length > 0) {
        avatar_url = $image.attr("xlink:href") || $image.attr("href") || "";
      }
    }

    // Extract name - look for span with dir="auto" that looks like a name
    // Usually has class containing "xtoi2st" or similar, and starts with capital letter
    let name = "";
    const $allSpans = $link.find('span[dir="auto"]');
    $allSpans.each((_, el) => {
      const text = $(el).text().trim();
      // Skip if it's just a number (rank) or very short, or contains "Joined"
      if (
        text &&
        text.length > 2 &&
        text.length < 50 &&
        !/^\d+$/.test(text) &&
        !text.toLowerCase().includes("joined") &&
        !text.toLowerCase().includes("contributor") &&
        !text.toLowerCase().includes("ago") &&
        /^[A-Z]/.test(text)
      ) {
        name = text;
        return false; // break
      }
    });

    // Extract badge - look for span containing badge text
    let badge: ParsedContributor["badge"] = null;
    $allSpans.each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text.includes("all-star contributor")) {
        badge = "all-star contributor";
        return false;
      } else if (text.includes("top contributor")) {
        badge = "top contributor";
        return false;
      } else if (text.includes("rising contributor")) {
        badge = "rising contributor";
        return false;
      }
    });

    // Extract stats - menggunakan approach yang lebih robust
    // Helper: parse angka, aman buat "1,234" juga
    function parseStatNumber(raw: string): number {
      const t = (raw || "").trim().replace(/,/g, "");
      if (!t) return 0;

      // kalau suatu saat fb ngasih 1K / 2.5K, tetep kebaca
      const m = t.match(/^(\d+(?:\.\d+)?)([kKmM])$/);
      if (m) {
        const n = parseFloat(m[1]);
        const mult = m[2].toLowerCase() === "k" ? 1000 : 1000000;
        return Math.round(n * mult);
      }

      return /^\d+$/.test(t) ? parseInt(t, 10) : 0;
    }

    // helper, cari card container yang mencakup link + stats (sibling)
    function findCardScope($a: cheerio.Cheerio): cheerio.Cheerio {
      const roleHit = $a.closest(
        'div[role="listitem"], div[role="row"], div[role="article"]'
      );
      if (roleHit.length) return roleHit.first();

      // fallback, naik beberapa parent dan pilih yang punya >= 3 block xyqm7xq
      let $cur = $a.parent();
      for (let i = 0; i < 15; i++) {
        if (!$cur || !$cur.length) break;
        const blocks = $cur.find('div.xyqm7xq span[dir="auto"]');
        if (blocks.length >= 3) return $cur;
        $cur = $cur.parent();
      }
      return $a.parent().length ? $a.parent() : $a;
    }

    let posts = 0;
    let comments = 0;
    let reactions = 0;

    // Cari container stats yang tepat: div.x1qughib yang berisi 3 div langsung (posts, comments, reactions)
    // Struktur HTML untuk setiap contributor:
    // <a> (link)
    //   <div> (container utama)
    //     <div> (rank container)
    //     <div> (avatar + name container)
    //     <div class="xamitd3"> (stats wrapper)
    //       <div class="x1qughib"> (stats container dengan 3 children)

    let $statsContainer = $([]);

    // Strategy 1: Cari div.x1qughib yang berada di dalam div.xamitd3 di dalam link
    // Class xamitd3 adalah wrapper untuk stats section yang unik untuk setiap contributor
    const $statsWrapper = $link.find("div.xamitd3").first();
    if ($statsWrapper.length > 0) {
      $statsContainer = $statsWrapper.find("div.x1qughib").first();
      console.log(
        `[DEBUG Rank ${rank}] Found stats container via xamitd3 wrapper`
      );
    }

    // Strategy 2: Jika tidak ketemu, cari semua div.x1qughib di dalam link, pilih yang punya 3 children dengan x1q0g3np
    if ($statsContainer.length === 0) {
      const $allStatsContainers = $link.find("div.x1qughib");
      console.log(
        `[DEBUG Rank ${rank}] Found ${$allStatsContainers.length} div.x1qughib in link`
      );
      $allStatsContainers.each((_, container) => {
        const $container = $(container);
        const $children = $container.children("div").filter((_, el) => {
          const classes = $(el).attr("class") || "";
          return classes.includes("x1q0g3np");
        });
        console.log(
          `[DEBUG Rank ${rank}] Container has ${$children.length} children with x1q0g3np`
        );
        if ($children.length >= 3 && $statsContainer.length === 0) {
          $statsContainer = $container;
          console.log(
            `[DEBUG Rank ${rank}] Selected stats container with ${$children.length} children`
          );
          return false; // break
        }
      });
    }

    // Strategy 3: Fallback - cari di card scope (jika stats berada di luar link)
    if ($statsContainer.length === 0) {
      console.log(`[DEBUG Rank ${rank}] Trying card scope fallback`);
      const $card = findCardScope($link);
      const $allStatsContainers = $card.find("div.x1qughib");
      $allStatsContainers.each((_, container) => {
        const $container = $(container);
        const $children = $container.children("div").filter((_, el) => {
          const classes = $(el).attr("class") || "";
          return classes.includes("x1q0g3np");
        });
        if ($children.length >= 3 && $statsContainer.length === 0) {
          $statsContainer = $container;
          console.log(
            `[DEBUG Rank ${rank}] Found stats container in card scope`
          );
          return false; // break
        }
      });
    }

    if ($statsContainer.length > 0) {
      // Ambil 3 direct children div dari stats container
      // Filter untuk memastikan kita hanya ambil div yang punya class x1q0g3np (stat div)
      const $statDivs = $statsContainer.children("div").filter((_, el) => {
        const classes = $(el).attr("class") || "";
        return classes.includes("x1q0g3np");
      });

      console.log(
        `[DEBUG Rank ${rank}] Found ${$statDivs.length} stat divs in container`
      );

      if ($statDivs.length >= 3) {
        // Process setiap stat div berdasarkan urutan: 0=posts, 1=comments, 2=reactions
        $statDivs.each((index: number, statDiv: cheerio.Element) => {
          if (index >= 3) return; // Hanya process 3 pertama

          const $statDiv = $(statDiv);
          // Cari div.xyqm7xq > span[dir="auto"] di dalam statDiv
          const $valueSpan = $statDiv
            .find('div.xyqm7xq span[dir="auto"]')
            .first();

          if ($valueSpan.length > 0) {
            const valueText = $valueSpan.text().trim();
            const value = parseStatNumber(valueText);

            console.log(
              `[DEBUG Rank ${rank}] Stat[${index}]: text="${valueText}", parsed=${value}`
            );

            // Assign berdasarkan index: 0=posts, 1=comments, 2=reactions
            if (index === 0) {
              posts = value;
            } else if (index === 1) {
              comments = value;
            } else if (index === 2) {
              reactions = value;
            }
          } else {
            console.warn(
              `[DEBUG Rank ${rank}] Stat[${index}]: No value span found`
            );
          }
        });
      } else if ($statDivs.length > 0) {
        console.warn(
          `[DEBUG Rank ${rank}] Only found ${$statDivs.length} stat divs, expected 3`
        );
        // Jika kurang dari 3, ambil yang ada saja
        $statDivs.each((index: number, statDiv: cheerio.Element) => {
          const $statDiv = $(statDiv);
          const $valueSpan = $statDiv
            .find('div.xyqm7xq span[dir="auto"]')
            .first();

          if ($valueSpan.length > 0) {
            const valueText = $valueSpan.text().trim();
            const value = parseStatNumber(valueText);

            if (index === 0) posts = value;
            else if (index === 1) comments = value;
            else if (index === 2) reactions = value;
          }
        });
      } else {
        console.warn(`[DEBUG Rank ${rank}] No stat divs found in container`);
      }
    } else {
      console.warn(
        `[DEBUG Rank ${rank}] No stats container (div.x1qughib) found`
      );
    }

    // Fallback: jika tidak ketemu dengan cara di atas, gunakan cara lama
    if (posts === 0 && comments === 0 && reactions === 0) {
      const $card = findCardScope($link);
      const statTextsAll = $card
        .find('div.xyqm7xq span[dir="auto"]')
        .toArray()
        .filter((el: cheerio.Element) => el !== rankEl)
        .map((el: cheerio.Element) => $(el).text().trim())
        .filter(
          (t: string) => /^\d[\d,]*$/.test(t) || /^\d+(?:\.\d+)?[kKmM]$/.test(t)
        );

      const statTexts = statTextsAll.slice(-3);
      posts = parseStatNumber(statTexts[0] || "0");
      comments = parseStatNumber(statTexts[1] || "0");
      reactions = parseStatNumber(statTexts[2] || "0");

      console.warn(
        `[DEBUG Rank ${rank}] Using fallback method: posts=${posts}, comments=${comments}, reactions=${reactions}`
      );
    }

    // DEBUG: Log untuk memastikan parsing benar
    console.log(
      `[DEBUG] Rank ${rank}: posts=${posts}, comments=${comments}, reactions=${reactions}, name=${name}`
    );

    // Only add if we have valid rank
    if (rank > 0 && rank <= 10) {
      contributors.push({
        rank,
        name: name || `Contributor ${rank}`,
        avatar_url: avatar_url || "",
        posts,
        comments,
        reactions,
        badge,
      });
    }
  });

  // Sort by rank to ensure correct order
  contributors.sort((a, b) => a.rank - b.rank);

  // Remove duplicates based on rank
  const uniqueContributors: ParsedContributor[] = [];
  const seenRanks = new Set<number>();
  contributors.forEach((contributor) => {
    if (!seenRanks.has(contributor.rank) && contributor.rank > 0) {
      seenRanks.add(contributor.rank);
      uniqueContributors.push(contributor);
    }
  });

  // Ensure we have exactly 10, fill missing ranks
  const result: ParsedContributor[] = [];
  for (let i = 1; i <= 10; i++) {
    const existing = uniqueContributors.find((c) => c.rank === i);
    if (existing) {
      result.push(existing);
    } else {
      result.push({
        rank: i,
        name: "",
        avatar_url: "",
        posts: 0,
        comments: 0,
        reactions: 0,
        badge: null,
      });
    }
  }

  return result;
}

/**
 * Parse date from HTML string
 * Looks for "Last updated on [Month] [Day], [Year]" pattern
 * Returns month abbreviation (3 letters) and year
 */
export function parseDate(
  htmlString: string
): { month: string; year: string } | null {
  const $ = cheerio.load(htmlString);

  // Look for text containing "Last updated on"
  // Find span with dir="auto" that contains "Last updated on"
  const dateText = $('span[dir="auto"]')
    .toArray()
    .map((el) => $(el).text())
    .find((text) => text.includes("Last updated on"));

  if (!dateText) return null;

  // Match both "Dec 28, 2025" (3-letter) and "December 28, 2025" (full month)
  const dateMatch = dateText.match(/Last updated on\s+(\w+)\s+\d+,\s+(\d{4})/i);

  if (dateMatch) {
    const monthStr = dateMatch[1];
    const year = dateMatch[2];

    // If already 3 letters, use as is (capitalize first letter)
    if (monthStr.length <= 3) {
      return {
        month:
          monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase(),
        year,
      };
    }

    // Convert full month name to 3-letter abbreviation
    const monthMap: { [key: string]: string } = {
      january: "Jan",
      february: "Feb",
      march: "Mar",
      april: "Apr",
      may: "May",
      june: "Jun",
      july: "Jul",
      august: "Aug",
      september: "Sep",
      october: "Oct",
      november: "Nov",
      december: "Dec",
    };

    const month = monthMap[monthStr.toLowerCase()] || monthStr.substring(0, 3);

    return { month, year };
  }

  return null;
}
