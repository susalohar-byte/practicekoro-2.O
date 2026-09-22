import os

svg_dir = "public/images/exams"
os.makedirs(svg_dir, exist_ok=True)

# 1. WBSSC
wbssc_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <defs>
    <linearGradient id="wbsscGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="wbsscRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#991B1B" />
    </linearGradient>
    <filter id="wbsscShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Top Finial / Star Crown -->
  <path d="M40 8 L43 14 L49 15 L44 19 L46 25 L40 21 L34 25 L36 19 L31 15 L37 14 Z" fill="url(#wbsscGold)" filter="url(#wbsscShadow)"/>
  
  <!-- Outer Gold Laurel / Crescent -->
  <path d="M22 34 C20 48 30 62 40 65 C50 62 60 48 58 34 C56 25 49 20 40 20 C31 20 24 25 22 34 Z" fill="url(#wbsscGold)" filter="url(#wbsscShadow)"/>
  
  <!-- Red Shield Center -->
  <path d="M26 35 C25 46 32 57 40 59 C48 57 55 46 54 35 C53 28 47 24 40 24 C33 24 27 28 26 35 Z" fill="url(#wbsscRed)"/>
  
  <!-- Inner Biswa Bangla / Emblem Motif -->
  <!-- Central golden torch/pillar -->
  <circle cx="40" cy="35" r="4.5" fill="#FDE047"/>
  <path d="M37 42 C37 38 43 38 43 42 L42 53 C42 54 38 54 38 53 Z" fill="url(#wbsscGold)"/>
  <!-- Winged swirls -->
  <path d="M33 39 C30 45 34 50 37 51" stroke="#FDE047" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M47 39 C50 45 46 50 43 51" stroke="#FDE047" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  
  <!-- Bottom Ribbon / Scroll -->
  <path d="M24 64 C30 62 36 65 40 65 C44 65 50 62 56 64 L58 68 C50 66 45 68 40 68 C35 68 30 66 22 68 Z" fill="url(#wbsscGold)"/>
  <rect x="30" y="66" width="20" height="3" rx="1.5" fill="#B45309"/>
</svg>'''

# 2. WBP Constable
wbp_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <defs>
    <linearGradient id="wbpGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="40%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <linearGradient id="wbpRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#DC2626" />
      <stop offset="100%" stop-color="#991B1B" />
    </linearGradient>
    <linearGradient id="wbpBlue" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E40AF" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <filter id="wbpShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Ashoka Lions / Crown on top -->
  <g filter="url(#wbpShadow)">
    <path d="M34 14 C34 10 46 10 46 14 L48 22 L32 22 Z" fill="url(#wbpGold)"/>
    <circle cx="40" cy="12" r="3" fill="#FEF08A"/>
    <rect x="36" y="20" width="8" height="3" rx="1" fill="#92400E"/>
  </g>

  <!-- Shield Outer Gold Rim -->
  <path d="M22 23 C30 25 36 21 40 21 C44 21 50 25 58 23 C60 38 56 55 40 66 C24 55 20 38 22 23 Z" fill="url(#wbpGold)" filter="url(#wbpShadow)"/>

  <!-- Shield Split Red & Blue -->
  <!-- Left Red Half -->
  <path d="M25 26 C31 27 36 24 40 24 L40 63 C27 53 23 38 25 26 Z" fill="url(#wbpRed)"/>
  <!-- Right Blue Half -->
  <path d="M55 26 C49 27 44 24 40 24 L40 63 C53 53 57 38 55 26 Z" fill="url(#wbpBlue)"/>

  <!-- Center Golden Laurel Wreath -->
  <ellipse cx="40" cy="40" rx="10" ry="11" fill="none" stroke="url(#wbpGold)" stroke-width="2.5" stroke-dasharray="3.5 1.5"/>
  <!-- Crossed Swords / Star in center -->
  <circle cx="40" cy="40" r="4.5" fill="#FEF08A"/>
  <circle cx="40" cy="40" r="2.5" fill="#92400E"/>

  <!-- Banner / W.B. POLICE -->
  <path d="M25 61 C32 64 48 64 55 61 L53 67 C46 70 34 70 27 67 Z" fill="url(#wbpGold)"/>
  <rect x="34" y="63" width="12" height="2" rx="1" fill="#78350F"/>
</svg>'''

# 3. WBPSC Clerkship
wbpsc_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <defs>
    <linearGradient id="wbpscGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="35%" stop-color="#F59E0B" />
      <stop offset="70%" stop-color="#EA580C" />
      <stop offset="100%" stop-color="#C2410C" />
    </linearGradient>
    <filter id="wbpscShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.2"/>
    </filter>
  </defs>

  <g filter="url(#wbpscShadow)">
    <!-- Central Tower / Flame Pillar -->
    <path d="M37 15 C37 12 43 12 43 15 L44 58 L36 58 Z" fill="url(#wbpscGrad)"/>
    
    <!-- Left Curved Tower -->
    <path d="M29 23 C29 18 36 20 36 25 L36 58 C36 60 30 60 30 58 L30 30 C27 34 26 42 26 50 C26 59 21 59 21 50 C21 36 25 27 29 23 Z" fill="url(#wbpscGrad)"/>

    <!-- Right Curved Tower -->
    <path d="M51 23 C51 18 44 20 44 25 L44 58 C44 60 50 60 50 58 L50 30 C53 34 54 42 54 50 C54 59 59 59 59 50 C59 36 55 27 51 23 Z" fill="url(#wbpscGrad)"/>

    <!-- Arch Gateway cutout in center -->
    <path d="M37 42 C37 36 43 36 43 42 L43 59 L37 59 Z" fill="#FFF6E5"/>

    <!-- Base Pedestal -->
    <path d="M20 59 L60 59 L62 65 C62 67 18 67 18 65 Z" fill="url(#wbpscGrad)"/>
    <rect x="23" y="61" width="34" height="2" rx="1" fill="#FEF3C7"/>
  </g>
</svg>'''

# 4. Primary TET
tet_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <defs>
    <linearGradient id="tetRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#9F1239" />
    </linearGradient>
    <linearGradient id="tetGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <filter id="tetShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Top Flame of Knowledge -->
  <path d="M40 10 C43 14 46 17 44 20 C42 22 38 22 36 20 C34 17 37 14 40 10 Z" fill="url(#tetGold)" filter="url(#tetShadow)"/>

  <!-- Outer Crimson Crest Ring -->
  <path d="M22 27 C28 21 52 21 58 27 C62 33 63 50 56 59 C49 67 31 67 24 59 C17 50 18 33 22 27 Z" fill="url(#tetRed)" filter="url(#tetShadow)"/>
  
  <!-- Golden Beaded Border -->
  <circle cx="40" cy="43" r="18" fill="none" stroke="url(#tetGold)" stroke-width="1.8" stroke-dasharray="3 1.5"/>

  <!-- Inner White Medallion -->
  <circle cx="40" cy="43" r="14.5" fill="#FFFFFF"/>

  <!-- Open Book of Primary Education -->
  <path d="M31 43 C35 41 39 42 40 44 C41 42 45 41 49 43 L49 49 C45 47 41 48 40 50 C39 48 35 47 31 49 Z" fill="url(#tetRed)"/>
  <!-- Candle / Rising Sun above book -->
  <path d="M39 33 C39 31 41 31 41 33 L41 39 L39 39 Z" fill="url(#tetGold)"/>
  <circle cx="40" cy="32" r="2" fill="#FDE047"/>

  <!-- Bottom Scroll -->
  <path d="M26 62 C34 60 46 60 54 62 L52 66 C44 64 36 64 28 66 Z" fill="url(#tetGold)"/>
</svg>'''

# 5. SSC GD
ssc_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <defs>
    <linearGradient id="sscGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="40%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="sscBlue" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#1E3A8A" />
    </linearGradient>
    <linearGradient id="sscSilver" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <filter id="sscShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Ashoka Lion Capitol on Top -->
  <g filter="url(#sscShadow)">
    <path d="M33 13 C33 9 47 9 47 13 L49 22 L31 22 Z" fill="url(#sscGold)"/>
    <circle cx="40" cy="11" r="3" fill="#FDE047"/>
    <circle cx="35" cy="14" r="2" fill="#D97706"/>
    <circle cx="45" cy="14" r="2" fill="#D97706"/>
    <rect x="32" y="20" width="16" height="3" rx="1" fill="#78350F"/>
  </g>

  <!-- Silver Shield with Gold Border -->
  <path d="M22 24 C32 26 36 22 40 22 C44 22 48 26 58 24 C60 38 56 55 40 66 C24 55 20 38 22 24 Z" fill="url(#sscGold)" filter="url(#sscShadow)"/>
  <path d="M24 26 C32 28 36 24 40 24 C44 24 48 28 56 26 C57 38 54 53 40 63 C26 53 23 38 24 26 Z" fill="url(#sscSilver)"/>

  <!-- Red and Blue bands on shield -->
  <path d="M26 35 L54 35 L53 42 L27 42 Z" fill="#DC2626"/>
  <path d="M27 42 L53 42 L51 49 L29 49 Z" fill="url(#sscBlue)"/>

  <!-- Center Gold Wheel / Ashoka Chakra -->
  <circle cx="40" cy="42" r="6" fill="#FDE047" stroke="#B45309" stroke-width="1.5"/>
  <circle cx="40" cy="42" r="2.5" fill="#1E3A8A"/>

  <!-- Bottom SSC Ribbon Banner -->
  <path d="M22 61 C32 64 48 64 58 61 L56 67 C48 70 32 70 24 67 Z" fill="url(#sscGold)"/>
  <rect x="33" y="63" width="14" height="2.5" rx="1" fill="#1E3A8A"/>
</svg>'''

# 6. Railway NTPC
railway_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <defs>
    <linearGradient id="railGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <filter id="railShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Outer Decorative Ring / Stars -->
  <circle cx="40" cy="40" r="29" fill="none" stroke="url(#railGold)" stroke-width="2.5" filter="url(#railShadow)"/>
  
  <!-- Dashed Railway Track Ring -->
  <circle cx="40" cy="40" r="25" fill="none" stroke="#FDE047" stroke-width="1.2" stroke-dasharray="3 1.5"/>

  <!-- Inner Darker Disc -->
  <circle cx="40" cy="40" r="22" fill="#1E293B"/>

  <!-- Front Locomotive Steam Engine Face -->
  <!-- Boiler Body -->
  <circle cx="40" cy="38" r="14" fill="#0F172A" stroke="url(#railGold)" stroke-width="2"/>
  
  <!-- Headlight at Top Center -->
  <circle cx="40" cy="27" r="3.5" fill="#FEF08A" stroke="#B45309" stroke-width="1"/>
  <circle cx="40" cy="27" r="1.5" fill="#FFFFFF"/>

  <!-- Center Smoke Box / Round Hatch with Ashoka Star -->
  <circle cx="40" cy="38" r="7" fill="url(#railGold)"/>
  <circle cx="40" cy="38" r="3.5" fill="#0F172A"/>
  <circle cx="40" cy="38" r="1.5" fill="#FEF08A"/>

  <!-- Cowcatcher / Lower Buffer Grate -->
  <path d="M28 47 L52 47 L48 55 L32 55 Z" fill="url(#railGold)"/>
  <line x1="34" y1="47" x2="34" y2="55" stroke="#0F172A" stroke-width="1.5"/>
  <line x1="40" y1="47" x2="40" y2="55" stroke="#0F172A" stroke-width="1.5"/>
  <line x1="46" y1="47" x2="46" y2="55" stroke="#0F172A" stroke-width="1.5"/>

  <!-- Railway Buffers -->
  <circle cx="28" cy="47" r="2.5" fill="#FEF08A"/>
  <circle cx="52" cy="47" r="2.5" fill="#FEF08A"/>

  <!-- Stars of Zones around the top arc -->
  <g fill="#FEF08A">
    <circle cx="22" cy="28" r="1.5"/>
    <circle cx="27" cy="20" r="1.5"/>
    <circle cx="34" cy="15" r="1.5"/>
    <circle cx="46" cy="15" r="1.5"/>
    <circle cx="53" cy="20" r="1.5"/>
    <circle cx="58" cy="28" r="1.5"/>
  </g>
</svg>'''

with open(f"{svg_dir}/emblem_wbssc.svg", "w") as f:
    f.write(wbssc_svg)
with open(f"{svg_dir}/emblem_wbp.svg", "w") as f:
    f.write(wbp_svg)
with open(f"{svg_dir}/emblem_wbpsc.svg", "w") as f:
    f.write(wbpsc_svg)
with open(f"{svg_dir}/emblem_tet.svg", "w") as f:
    f.write(tet_svg)
with open(f"{svg_dir}/emblem_ssc.svg", "w") as f:
    f.write(ssc_svg)
with open(f"{svg_dir}/emblem_railway.svg", "w") as f:
    f.write(railway_svg)

print("All 6 SVGs generated successfully!")
