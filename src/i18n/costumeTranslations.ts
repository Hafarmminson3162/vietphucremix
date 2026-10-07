import { Costume } from '../data/costumes';
import { Language } from './translations';

export interface CostumeTranslation {
  name: string;
  group: string;
  ethnicity: string;
  meaning: string;
  structure: string;
  events: string;
  style: string;
}

export const COSTUME_EN_TRANSLATIONS: Record<string, CostumeTranslation> = {
  // =========================================================
  // --- I. WOMEN'S TRADITIONAL COSTUMES (15) ---
  // =========================================================
  f_cham_tay_nung: {
    name: "Traditional Indigo Attire",
    group: "Northeast",
    ethnicity: "Tày, Nùng, Sán Chay Ethnic Groups",
    meaning: "An ancient everyday and ceremonial attire of northern ethnic groups. Embodies rustic harmony with nature through artisanal hand-dyed natural indigo techniques.",
    structure: "Front-slit short jacket with fabric frogs fastened under the right armpit, loose deep-indigo trousers, woven fabric sash, and square headscarf.",
    events: "Daily wear, agricultural work, Lồng Tồng spring festival, Then spiritual chants, and wedding ceremonies.",
    style: "Aesthetic: Rustic, peaceful, graceful, and deeply connected to nature.",
  },
  f_ao_pan_muong: {
    name: "Áo Pắn & Mường Skirt",
    group: "Northwest",
    ethnicity: "Mường Ethnic Group",
    meaning: "Rooted in ancient Mường culture (Mường Bi, Vang). The white jacket symbolizes the pure sky and higher realm; the skirt waistband acts as a woven cosmological canvas echoing Đông Sơn bronze drum motifs.",
    structure: "Short cropped Áo Pắn fitting snug at the waist, long straight black tube skirt adorned with an exquisitely woven geometric waistband and silver chain accessories (xà tích).",
    events: "Khai Hạ spring festival, weddings, Lunar New Year celebrations, and Mường bronze gong dances.",
    style: "Aesthetic: Earthy yet sophisticated, carrying the profound cultural identity of mountain highlands.",
  },
  f_ao_com_thai: {
    name: "Áo Cóm & Black Thai Skirt",
    group: "Northwest",
    ethnicity: "Thái Ethnic Group",
    meaning: "Timeless traditional attire celebrated through generations of Thái women. Flatters the slender feminine silhouette; the Piêu scarf carries deep spiritual blessings and romantic devotion.",
    structure: "Form-fitting short cropped Áo Cóm fastened with delicate silver butterfly buttons (hàng khuy bướm), ankle-length black silk skirt, complemented by an intricately embroidered Piêu scarf.",
    events: "Hoa Ban flower festival, Xòe circle dance, bamboo pole dance (múa sạp), and traditional matrimonial ceremonies.",
    style: "Aesthetic: Delicate, supple, poetic, and tenderly feminine.",
  },
  f_ao_mong: {
    name: "Pleated Skirt & H'Mông Tunic",
    group: "Highland Mountains",
    ethnicity: "H'Mông Ethnic Group",
    meaning: "Hand-spun, hand-woven hemp costume perfected through generations. Demonstrates masterful craftsmanship in beeswax batik printing (wax-resist dyeing) and vibrant cross-stitch embroidery.",
    structure: "Embroidered front-slit tunic, voluminous accordion-pleated linen skirt, embroidered apron (tạp dề), woven sash, and decorative leg gaiters (xà cạp).",
    events: "Weddings, Independence Festival, Gầu Tào spring ritual, and highland open-air fairs.",
    style: "Aesthetic: Vibrant, bold, magnificent, and evocative of misty mountain peaks.",
  },
  f_dao_do: {
    name: "Red Dao Traditional Attire",
    group: "Highland Mountains",
    ethnicity: "Red Dao (Dao Đỏ) Ethnic Group",
    meaning: "Ancient heritage entwined with animistic reverence for nature and ancestral spirits. Brilliant red hues symbolize good fortune, sacred fire, and divine protection.",
    structure: "Knee-length tunic trimmed with vibrant red woolen pom-poms across the chest, trousers embroidered with auspicious geometric patterns, and a majestic towering red headdress.",
    events: "Cấp Sắc initiation rituals, weddings, and traditional tribal cultural gatherings.",
    style: "Aesthetic: Saturated scarlet brilliance, mystical, spiritually revered, and visually striking.",
  },
  f_tay_nguyen: {
    name: "Central Highlands Wrap Skirt & Tunic",
    group: "Central Highlands",
    ethnicity: "Central Highlands Ethnic Groups (Ê Đê, Ba Na, Gia Rai)",
    meaning: "Centuries-old backstrap weaving tradition of the central plateaus. Closely tied to the Gong culture UNESCO heritage, animist deities, and fertile harvest rituals.",
    structure: "Long wrap-around skirt paired with a sleeveless or cropped bodice on dark indigo handloom fabric accented with striking red, yellow, and white geometric stripes.",
    events: "Gong festivals, New Rice ceremonies (mừng lúa mới), and community buffalo-sacrifice celebrations.",
    style: "Aesthetic: Robust, primal, heroic, resonant with the spirits of the primeval jungle.",
  },
  f_phuong_bao: {
    name: "Empress Phoenix Robe (Phượng Bào)",
    group: "Imperial Dynasties",
    ethnicity: "Imperial Dynasties (Lê, Nguyễn Dynasties)",
    meaning: "The supreme ceremonial vestment worn by Empresses and Queen Mothers in feudal Vietnam. Symbolizes imperial sovereignty, cosmic maternal benevolence, with golden flying phoenixes embodying supreme nobility and virtue.",
    structure: "Floor-length imperial robe of supreme silk or brocade, richly hand-embroidered with gold and silver couching featuring soaring phoenixes, auspicious clouds, and tidal waves, accessorized with an ornate jeweled phoenix crown.",
    events: "Imperial coronation, grand court banquets, ancestral rites at the ancestral temple, and major historical reenactments.",
    style: "Aesthetic: Supreme regality, awe-inspiring magnificence, and breathtaking sovereign grandeur.",
  },
  f_nhat_binh: {
    name: "Nhật Bình Imperial Robe",
    group: "Imperial Dynasties",
    ethnicity: "Nguyễn Dynasty Imperial Court / Vietnamese",
    meaning: "Adapted and reformed from historical Phi Phong robes to codify Đại Việt court protocol. Daily dress for Empresses, Princesses, and noble consorts, and formal ceremonial wear for noble ladies. Five-color sleeve bands symbolize the Five Universal Elements.",
    structure: "Parallel-front robe (đối khâm) with a signature rectangular embroidered collar plate across the chest, wide sleeves trimmed with five-color bands (ngũ sắc), and trailing tasseled cords.",
    events: "Traditional court ceremonies, high-end traditional weddings, and royal cultural performances.",
    style: "Aesthetic: Noble, graceful, stately, exuding the sublime aura of the Imperial Citadel of Huế.",
  },
  f_ao_yem: {
    name: "Áo Yếm (Traditional Silk Camisole)",
    group: "Red River Delta",
    ethnicity: "Vietnamese (Kinh Folk Culture)",
    meaning: "An iconic intimate undergarment with hundreds of years of cultural history in Vietnam. Celebrates the demure yet alluring beauty of Vietnamese women, celebrated throughout folk poetry and pastoral life.",
    structure: "Diamond-shaped or square silk fabric with a curved neck cut, secured with delicate neck and back ties, accentuating graceful shoulders and silhouette.",
    events: "Worn beneath Four-panel or Five-panel robes, traditional performing arts, vintage photography, and folk festivals.",
    style: "Aesthetic: Sensual yet modest, tender, poetic, and purely traditional.",
  },
  f_ao_tu_than: {
    name: "Áo Tứ Thân (Four-Panel Folk Robe)",
    group: "Red River Delta",
    ethnicity: "Kinh Ethnic Group",
    meaning: "The definitive traditional attire of northern Vietnamese women. The four panels symbolize the four parents (one's own and one's in-laws); the two front panels tied together represent marital fidelity and eternal devotion.",
    structure: "Long four-panel robe (two back panels stitched into a spine seam, two front panels flowing or tied), worn over a peach-blossom Áo Yếm, a flowing silk waistband, black pleated skirt, and broad conical hat (Nón Quai Thao).",
    events: "Spring festivals, Lim Festival, Quan Họ folk duets, Chèo opera, and village gatherings in the Red River Delta.",
    style: "Aesthetic: Chaste, rustic, poetic, capturing the pastoral soul of ancient Kinh Bắc.",
  },
  f_ao_ngu_than: {
    name: "Áo Ngũ Thân (Five-Panel Robe - Women)",
    group: "Red River Delta",
    ethnicity: "Kinh Ethnic Group / Imperial Era",
    meaning: "Evolved under Lord Nguyễn Phúc Khoát and formalized into national dress across Vietnam. The five panels symbolize the four parents and the wearer; five buttons signify the Five Confucian Virtues (Benevolence, Decorum, Justice, Wisdom, Trust).",
    structure: "Five-panel construction with an inner child flap, standing mandarin collar fastened with five buttons along the collar and under the right arm, tailored with fitted sleeves (tay chẽn) or wide sleeves (tay thụng), worn with loose silk pants and hair turban.",
    events: "Weddings, Lunar New Year, ceremonial anniversaries, diplomacy, and distinguished formal gatherings.",
    style: "Aesthetic: Elegant, modest, virtuous, scholarly, and adhering to refined orthodox etiquette.",
  },
  f_ao_dai_cach_tan: {
    name: "Modernized Áo Dài (Women)",
    group: "Red River Delta",
    ethnicity: "Kinh Ethnic Group / Contemporary",
    meaning: "The contemporary creative evolution of the iconic Vietnamese Áo Dài. Harmonizes ancient cultural aesthetic codes with modern versatility, embodying youthful dynamism and contemporary grace.",
    structure: "Streamlined midi-length tunic embroidered with peacock and floral motifs in shimmering gold brocade thread, modern standing collar, paired with wide silk pants or flowing pleated skirts.",
    events: "Lunar New Year promenades, art photography, cultural exhibitions, and formal celebrations.",
    style: "Aesthetic: Youthful, vibrant, radiant, while retaining classic East Asian charm.",
  },
  f_ao_ba_ba: {
    name: "Áo Bà Ba & Checked Scarf (Women)",
    group: "Southern Region",
    ethnicity: "Kinh Ethnic Group (Mekong Delta)",
    meaning: "Developed during the pioneering settlement of the southern frontiers. Honors the warm-hearted kindness, industrious spirit, and resilient grace of women in the Mekong Delta.",
    structure: "Side-slit silk or cotton tunic with round or scoop neck, paired with loose flowing trousers, iconic black-and-white checked gingham scarf (khăn rằn), and wooden clogs.",
    events: "Everyday rural life, river floating markets, southern folk festivals, and Đờn Ca Tài Tử musical performances.",
    style: "Aesthetic: Simple, benevolent, approachable, and steeped in southern warmth.",
  },
  f_cham: {
    name: "Traditional Chăm Women's Attire",
    group: "South Central Coast",
    ethnicity: "Chăm Ethnic Group",
    meaning: "Ancient heritage of Champa civilization, intertwined with Brahmanism and Chăm Bani traditions. Exudes a sacred, mystical aura reminiscent of ancient coastal kingdoms and sanctuary towers.",
    structure: "Vibrant yellow hand-woven sarong wrapped with an intricately embroidered red sash, close-fitting tunic, complemented by a Katap ceremonial head covering for elder women.",
    events: "Katê Festival, Ramưwan sacred month, Apsara temple dances, and communal heritage rituals.",
    style: "Aesthetic: Splendid, regal, sacred, combining solemn spiritual presence with coastal colors.",
  },
  f_suon_xam: {
    name: "Traditional Qipao / Cheongsam",
    group: "Urban",
    ethnicity: "Hoa (Chinese-Vietnamese) Ethnic Group",
    meaning: "Traditional Chinese costume localized and integrated into the vibrant cultural tapestry of Vietnam's Chinese-Vietnamese communities. Symbolizes auspicious fortune, prosperity, and wealth.",
    structure: "Form-fitting silk brocade dress with high side slits, high mandarin collar, traditional knotted frog closures, or imperial silk tunic embroidered with dragon and phoenix motifs.",
    events: "Lunar New Year, Mid-Autumn Festival, matrimonial celebrations, and dragon dance festivals.",
    style: "Aesthetic: Opulent, sophisticated, aristocratic, blending classic East Asian heritage with contemporary poise.",
  },

  // =========================================================
  // --- II. MEN'S TRADITIONAL COSTUMES (17) ---
  // =========================================================
  m_cham_tay_nung: {
    name: "Traditional Indigo Attire (Men)",
    group: "Northeast",
    ethnicity: "Tày, Nùng, Sán Chay Ethnic Groups",
    meaning: "Long-standing functional and ceremonial attire of northern highland men. Reflects rugged honesty, craftsmanship in natural indigo, and respect for nature.",
    structure: "Front-buttoned indigo tunic with fabric frog closures under the arm, wide straight trousers dyed deep indigo, and fabric waist tie.",
    events: "Daily farming, community festivals, Lồng Tồng spring field rituals, and wedding ceremonies.",
    style: "Aesthetic: Rustic, sturdy, understated, and closely knit to the northern mountains.",
  },
  m_ao_cham_muong: {
    name: "Mường Indigo Robe & Trousers",
    group: "Northwest",
    ethnicity: "Mường Ethnic Group",
    meaning: "Rooted in ancient Mường culture. Reflects resilience, unyielding diligence, and the connection of Mường men to the valleys and forests.",
    structure: "Deep blue or indigo round-collar long-sleeved tunic trimmed with subtle woven borders, paired with loose-fitting trousers and a simple fabric sash.",
    events: "Khai Hạ spring festival, weddings, Lunar New Year rituals, and Mường bronze gong gatherings.",
    style: "Aesthetic: Earthy, stalwart, robust, and dignified.",
  },
  m_ao_cham_thai: {
    name: "Thai Indigo Robe (Men)",
    group: "Northwest",
    ethnicity: "Thái Ethnic Group",
    meaning: "Traditional male attire of the Thái ethnic group across generations. Demonstrates courtesy, respect, and order in community life and festive rituals.",
    structure: "Round-neck or front-slit indigo jacket accented with subtle brocade bands along the placket, worn over comfortable wide trousers.",
    events: "Hoa Ban flower festival, Xòe circle festivals, bamboo pole dance, and traditional wedding rites.",
    style: "Aesthetic: Humble, neat, respectful, and classic.",
  },
  m_ao_mong: {
    name: "H'Mông Jacket & Wide Trousers",
    group: "Highland Mountains",
    ethnicity: "H'Mông Ethnic Group",
    meaning: "Traditional hand-woven hemp attire of highland H'Mông men. Designed for agility, strength, and ease of movement across rugged terrain.",
    structure: "Cropped front-buttoned jacket, low-crotch wide-leg trousers, minimalist headwrap, frequently paired with the sacred H'Mông reed panpipe (khèn Mông).",
    events: "Weddings, Independence Festival, Gầu Tào spring festival, and mountain market gatherings.",
    style: "Aesthetic: Resolute, free-spirited, agile, and richly alpine.",
  },
  m_dao_do: {
    name: "Red Dao Men's Attire",
    group: "Highland Mountains",
    ethnicity: "Red Dao (Dao Đỏ) Ethnic Group",
    meaning: "Ancient heritage entwined with animistic reverence. Red thread embroidery symbolizes vitality, good fortune, and guardian spirits of the lineage.",
    structure: "Short tunic highlighted with intricate scarlet yarn embroidery and pom-poms, paired with wide trousers embroidered along the cuffs.",
    events: "Cấp Sắc maturity rituals, wedding ceremonies, and traditional community celebrations.",
    style: "Aesthetic: Sturdy, mystical, distinctive, and vibrant with scarlet accents.",
  },
  m_tay_nguyen: {
    name: "Central Highlands Loincloth & Tunic",
    group: "Central Highlands",
    ethnicity: "Central Highlands Ethnic Groups (Ê Đê, Ba Na, Gia Rai)",
    meaning: "Centuries-old tribal weaving traditions of the central plateaus. Symbolizes masculine valor, hunting prowess, and connection to the divine cosmos.",
    structure: "Long fringed loincloth wrapped around the waist, paired with a sleeveless slip-over tunic or short woven vest adorned with mythical avian and solar motifs.",
    events: "Gong festivals, harvest celebrations, and community ceremonies.",
    style: "Aesthetic: Heroic, primal, athletic, resonant with ancestral drumbeats.",
  },
  m_long_con: {
    name: "Long Cổn Imperial Dragon Robe",
    group: "Imperial Dynasties",
    ethnicity: "Imperial Court (Lý, Trần, Lê, Nguyễn Dynasties)",
    meaning: "The supreme grand court ceremonial vestment worn by the Emperor of Vietnam. Symbolizes the absolute mandate of the Son of Heaven ('True Dragon'). Encodes celestial cosmology through the Twelve Imperial Ornaments (Thập Nhị Chương).",
    structure: "Deep black or royal blue imperial silk robe embroidered with all Twelve Sacred Symbols (sun, moon, stars, sacred mountains, dragons, fire, pheasants, waterweeds...), paired with an embroidered underskirt (xiêm), jade belt, and pearl-fringed Crown of Heaven (mũ miện).",
    events: "Nam Giao Heaven Worship Ceremony, imperial coronations, and grand state assemblies of paramount national importance.",
    style: "Aesthetic: Absolute sovereign majesty, awe-inspiring, imbued with profound dynastic philosophy.",
  },
  m_phi_ngu: {
    name: "Phi Ngư Flying-Fish Court Robe",
    group: "Imperial Dynasties",
    ethnicity: "Imperial Dynasties (Đại Việt Court Officials & Imperial Guards)",
    meaning: "A prestigious court robe bestowed upon high-ranking ministers, imperial bodyguards, and noble officers in Đại Việt. The flying-fish motif (carp transforming into a celestial dragon) signifies rapid ascension, unswerving loyalty, and martial valor.",
    structure: "Round-collar robe (viên lĩnh) or tailored robe dominated by a massive embroidered flying dragon-fish couched in gold thread across the chest, back, and flowing hems.",
    events: "Imperial court audiences, citadel patrols, grand diplomatic ceremonies, and historical cultural festivals.",
    style: "Aesthetic: Valiant, commanding, martial, impeccably tailored, projecting bureaucratic and military poise.",
  },
  m_vien_linh: {
    name: "Áo Viên Lĩnh (Round-Collar Robe - Men)",
    group: "Imperial Dynasties",
    ethnicity: "Vietnamese (Lý, Trần, Lê, Nguyễn Dynasties)",
    meaning: "A prevalent historical robe worn by scholar-officials and gentry across multiple dynasties. Represents perfection, harmony, and institutional decorum in both court and scholarly settings.",
    structure: "Round-necked robe with an overlapping right-hand closure, tailored with wide flowing sleeves (tay thụng) or fitted sleeves (tay chẽn), fastened at the waist with an embroidered fabric sash.",
    events: "Historical cultural festivals, dynasty reenactments, academic exhibitions, and heritage research events.",
    style: "Aesthetic: Classical, serene, bookish, and highly authentic to medieval Vietnam.",
  },
  m_giao_linh: {
    name: "Áo Giao Lĩnh (Cross-Collar Robe - Men)",
    group: "Imperial Dynasties",
    ethnicity: "Vietnamese (Lý, Trần, Lê, Nguyễn Dynasties)",
    meaning: "One of the most foundational and archaic robe structures in East Asian and Đại Việt culture. Reflects yin-yang philosophy through overlapping front panels creating a dignified diagonal neckline.",
    structure: "Two panels crossing diagonally across the chest (left flap crossing over the right flap), forming an iconic V-neckline, secured with a woven sash, tailored in refined smoky grey or earth tones.",
    events: "Historical museum exhibitions, ancient-style cultural festivals, and period reenactments.",
    style: "Aesthetic: Dignified, ancient, philosophical, and unencumbered.",
  },
  m_doi_kham: {
    name: "Áo Đối Khâm (Parallel-Collar Robe - Men)",
    group: "Imperial Dynasties",
    ethnicity: "Vietnamese (Lý, Trần, Lê Dynasties)",
    meaning: "A symmetrical robe with parallel vertical front borders, widely worn as an outer robe across Vietnamese history. Imparts an aura of balance, poise, and dignified presence.",
    structure: "Open-front outer coat with two parallel vertical edges falling straight down without overlapping, rendered in bright jade tones and paired with a traditional conical hat or turban.",
    events: "Cultural celebrations, period costume galas, and traditional performing arts.",
    style: "Aesthetic: Free-spirited, expansive, majestic, and graceful when layered.",
  },
  m_ao_tu_than: {
    name: "Áo Tứ Thân (Four-Panel Robe - Men)",
    group: "Red River Delta",
    ethnicity: "Kinh Ethnic Group",
    meaning: "Historical attire of northern Vietnamese men, scholars, and traditional performing artists (Ca Trù, Chèo). Celebrates the debonair charm, artistic sensitivity, and wit of northern literati.",
    structure: "Four-panel gauze tunic tailored in dual tones, fitted sleeves, worn over white silk trousers, paired with a crimson folding fan and traditional wrapped turban.",
    events: "Folk music festivals, Ca Trù recitals, Chèo opera performances, and vintage fine-art photoshoots.",
    style: "Aesthetic: Scholarly, artistic, poised, and steeped in ancient Kinh Bắc flavor.",
  },
  m_ao_ngu_than: {
    name: "Áo Ngũ Thân (Five-Panel Robe - Men)",
    group: "Red River Delta",
    ethnicity: "Kinh Ethnic Group / Imperial Era",
    meaning: "Formulated and codified under Lord Nguyễn Phúc Khoát as the national attire of Vietnam. A national cultural emblem embodying male dignity, integrity, and Confucian refinement.",
    structure: "Five-panel tunic with fitted sleeves (tay chẽn) or wide sleeves (tay thụng), secured with five buttons under the right collar, worn over white silk trousers and a black wrapped turban (khăn đóng).",
    events: "Weddings, Lunar New Year, ceremonial anniversaries, international diplomatic forums, and grand formal galas.",
    style: "Aesthetic: Gallant, noble, dignified, and quintessential Vietnamese gentlemanly poise.",
  },
  m_ao_dai_cach_tan: {
    name: "Modernized Áo Dài (Men)",
    group: "Red River Delta",
    ethnicity: "Kinh Ethnic Group / Contemporary",
    meaning: "A dynamic contemporary reinvention of the traditional male Áo Dài. Embodies strength, confidence, and distinction for Vietnamese men on landmark occasions.",
    structure: "Structured, crisp tailored tunic embroidered with a dynamic celestial golden dragon soaring among stylized clouds, standing mandarin collar, diagonal button fastening, paired with tailored trousers.",
    events: "Weddings (groom attire), spring galas, diplomatic receptions, and stage performances.",
    style: "Aesthetic: Commanding, opulent, charismatic, and richly symbolic of prosperity.",
  },
  m_ao_ba_ba: {
    name: "Áo Bà Ba & Checked Scarf (Men)",
    group: "Southern Region",
    ethnicity: "Kinh Ethnic Group (Mekong Delta)",
    meaning: "Developed during the frontier expansion into the southern delta. Honors the generous hospitality, unpretentious sincerity, and deep loyalty of southern Vietnamese men.",
    structure: "Side-slit comfortable tunic with round or scoop collar, roomy trousers, iconic checkered gingham scarf (khăn rằn), and straw conical hat.",
    events: "Daily countryside life, river markets, southern festivals, and traditional folk music gatherings.",
    style: "Aesthetic: Warm, genial, unpretentious, and full of southern generosity.",
  },
  m_cham: {
    name: "Traditional Chăm Men's Attire",
    group: "South Central Coast",
    ethnicity: "Chăm Ethnic Group",
    meaning: "Ancient heritage of Champa culture, closely connected with Brahmanism and Chăm Bani traditions. Inspires spiritual reverence, honoring ancestors and the holy sanctuaries.",
    structure: "White sarong or loose trousers woven with stylized sanctuary tower motifs at the border, embroidered tunic, paired with a white headcloth or Kupiah cap.",
    events: "Katê Festival, Ramưwan ceremonies, Chăm folk dances, and cultural celebrations.",
    style: "Aesthetic: Solemn, dignified, carrying profound ancient religious and cultural echoes.",
  },
  m_hoa: {
    name: "Traditional Chinese-Vietnamese Attire (Men)",
    group: "Urban",
    ethnicity: "Hoa (Chinese-Vietnamese) Ethnic Group",
    meaning: "Traditional Chinese costume localized across the Chinese-Vietnamese communities in urban centers. Symbolizes longevity, smooth fortunes, and abundant prosperity.",
    structure: "Long silk tunic or high-collar black brocade jacket embroidered with twin dragons gazing at the flaming pearl (song long chầu nguyệt), fastened with knotted Chinese frogs, paired with matching black trousers.",
    events: "Lunar New Year, Mid-Autumn Festival, wedding banquets, and lion & dragon dance festivals.",
    style: "Aesthetic: Prestigious, distinguished, and deeply rooted in East Asian festival traditions.",
  },
};

/**
 * Returns localized data for a given Costume according to the active language.
 */
export function getLocalizedCostume(costume: Costume, lang: Language): CostumeTranslation {
  if (lang === 'vi') {
    return {
      name: costume.name,
      group: costume.group,
      ethnicity: costume.ethnicity,
      meaning: costume.meaning,
      structure: costume.structure,
      events: costume.events,
      style: costume.style,
    };
  }

  const en = COSTUME_EN_TRANSLATIONS[costume.id];
  if (!en) {
    return {
      name: costume.name,
      group: costume.group,
      ethnicity: costume.ethnicity,
      meaning: costume.meaning,
      structure: costume.structure,
      events: costume.events,
      style: costume.style,
    };
  }

  return en;
}
