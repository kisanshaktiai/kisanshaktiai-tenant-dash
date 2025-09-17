-- Clear existing crops to avoid duplicates
TRUNCATE TABLE crops CASCADE;

-- Insert comprehensive list of crops planted in India with proper icons

-- CEREALS
INSERT INTO crops (label, value, icon, crop_group_id, metadata) VALUES
('Rice', 'rice', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Oryza sativa", "season": ["kharif", "rabi"], "duration_days": 120}'),
('Wheat', 'wheat', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Triticum aestivum", "season": ["rabi"], "duration_days": 120}'),
('Maize', 'maize', '🌽', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Zea mays", "season": ["kharif", "rabi"], "duration_days": 90}'),
('Jowar (Sorghum)', 'jowar', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Sorghum bicolor", "season": ["kharif", "rabi"], "duration_days": 105}'),
('Bajra (Pearl Millet)', 'bajra', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Pennisetum glaucum", "season": ["kharif"], "duration_days": 80}'),
('Ragi (Finger Millet)', 'ragi', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Eleusine coracana", "season": ["kharif"], "duration_days": 100}'),
('Barley', 'barley', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Hordeum vulgare", "season": ["rabi"], "duration_days": 120}'),
('Small Millets', 'small_millets', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Various", "season": ["kharif"], "duration_days": 70}'),
('Kodo Millet', 'kodo_millet', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Paspalum scrobiculatum", "season": ["kharif"], "duration_days": 80}'),
('Foxtail Millet', 'foxtail_millet', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Setaria italica", "season": ["kharif"], "duration_days": 70}'),
('Barnyard Millet', 'barnyard_millet', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Echinochloa esculenta", "season": ["kharif"], "duration_days": 60}'),
('Little Millet', 'little_millet', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Panicum sumatrense", "season": ["kharif"], "duration_days": 65}'),
('Proso Millet', 'proso_millet', '🌾', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Panicum miliaceum", "season": ["kharif"], "duration_days": 60}');

-- PULSES
INSERT INTO crops (label, value, icon, crop_group_id, metadata) VALUES
('Chickpea (Chana)', 'chickpea', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Cicer arietinum", "season": ["rabi"], "duration_days": 100}'),
('Pigeon Pea (Arhar/Tur)', 'pigeon_pea', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Cajanus cajan", "season": ["kharif"], "duration_days": 160}'),
('Green Gram (Moong)', 'green_gram', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Vigna radiata", "season": ["kharif", "summer"], "duration_days": 65}'),
('Black Gram (Urad)', 'black_gram', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Vigna mungo", "season": ["kharif"], "duration_days": 75}'),
('Lentil (Masoor)', 'lentil', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Lens culinaris", "season": ["rabi"], "duration_days": 110}'),
('Field Pea (Matar)', 'field_pea', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Pisum sativum", "season": ["rabi"], "duration_days": 90}'),
('Kidney Bean (Rajma)', 'kidney_bean', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Phaseolus vulgaris", "season": ["kharif"], "duration_days": 90}'),
('Moth Bean', 'moth_bean', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Vigna aconitifolia", "season": ["kharif"], "duration_days": 75}'),
('Horse Gram (Kulthi)', 'horse_gram', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Macrotyloma uniflorum", "season": ["kharif", "rabi"], "duration_days": 120}'),
('Cowpea (Lobia)', 'cowpea', '🫘', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Vigna unguiculata", "season": ["kharif"], "duration_days": 80}');

-- OILSEEDS
INSERT INTO crops (label, value, icon, crop_group_id, metadata) VALUES
('Groundnut', 'groundnut', '🥜', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Arachis hypogaea", "season": ["kharif", "summer"], "duration_days": 100}'),
('Mustard', 'mustard', '🌻', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Brassica juncea", "season": ["rabi"], "duration_days": 110}'),
('Sunflower', 'sunflower', '🌻', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Helianthus annuus", "season": ["kharif", "rabi", "summer"], "duration_days": 90}'),
('Soybean', 'soybean', '🌰', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Glycine max", "season": ["kharif"], "duration_days": 100}'),
('Sesame (Til)', 'sesame', '🌰', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Sesamum indicum", "season": ["kharif"], "duration_days": 85}'),
('Safflower', 'safflower', '🌻', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Carthamus tinctorius", "season": ["rabi"], "duration_days": 120}'),
('Castor', 'castor', '🌱', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Ricinus communis", "season": ["kharif"], "duration_days": 150}'),
('Linseed', 'linseed', '🌰', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Linum usitatissimum", "season": ["rabi"], "duration_days": 110}'),
('Niger', 'niger', '🌰', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Guizotia abyssinica", "season": ["kharif"], "duration_days": 90}');

-- CASH CROPS
INSERT INTO crops (label, value, icon, crop_group_id, metadata) VALUES
('Cotton', 'cotton', '☁️', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Gossypium hirsutum", "season": ["kharif"], "duration_days": 180}'),
('Sugarcane', 'sugarcane', '🎋', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Saccharum officinarum", "season": ["kharif"], "duration_days": 365}'),
('Jute', 'jute', '🌿', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Corchorus capsularis", "season": ["kharif"], "duration_days": 120}'),
('Tobacco', 'tobacco', '🍃', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Nicotiana tabacum", "season": ["kharif", "rabi"], "duration_days": 120}'),
('Mesta', 'mesta', '🌿', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Hibiscus cannabinus", "season": ["kharif"], "duration_days": 120}'),
('Sisal', 'sisal', '🌿', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Agave sisalana", "season": ["perennial"], "duration_days": 730}'),
('Coir', 'coir', '🥥', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Cocos nucifera", "season": ["perennial"], "duration_days": 2190}'),
('Hemp', 'hemp', '🌿', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Cannabis sativa", "season": ["kharif"], "duration_days": 120}'),
('Ramie', 'ramie', '🌿', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Boehmeria nivea", "season": ["perennial"], "duration_days": 60}');

-- VEGETABLES (continuing with all vegetables...)
INSERT INTO crops (label, value, icon, crop_group_id, metadata) VALUES
('Tomato', 'tomato', '🍅', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Solanum lycopersicum", "season": ["kharif", "rabi"], "duration_days": 75}'),
('Onion', 'onion', '🧅', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Allium cepa", "season": ["kharif", "rabi"], "duration_days": 120}'),
('Potato', 'potato', '🥔', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Solanum tuberosum", "season": ["rabi"], "duration_days": 90}'),
('Brinjal (Eggplant)', 'brinjal', '🍆', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Solanum melongena", "season": ["kharif", "rabi"], "duration_days": 80}'),
('Okra (Bhindi)', 'okra', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Abelmoschus esculentus", "season": ["kharif", "summer"], "duration_days": 50}'),
('Cauliflower', 'cauliflower', '🥦', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Brassica oleracea var. botrytis", "season": ["rabi"], "duration_days": 90}'),
('Cabbage', 'cabbage', '🥬', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Brassica oleracea var. capitata", "season": ["rabi"], "duration_days": 90}'),
('Carrot', 'carrot', '🥕', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Daucus carota", "season": ["rabi"], "duration_days": 80}'),
('Radish', 'radish', '🌱', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Raphanus sativus", "season": ["rabi"], "duration_days": 40}'),
('Beetroot', 'beetroot', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Beta vulgaris", "season": ["rabi"], "duration_days": 60}'),
('Spinach', 'spinach', '🥬', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Spinacia oleracea", "season": ["rabi"], "duration_days": 30}'),
('Peas', 'peas', '🟢', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Pisum sativum", "season": ["rabi"], "duration_days": 90}'),
('French Beans', 'french_beans', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Phaseolus vulgaris", "season": ["kharif", "rabi"], "duration_days": 60}'),
('Bottle Gourd', 'bottle_gourd', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Lagenaria siceraria", "season": ["kharif", "summer"], "duration_days": 70}'),
('Bitter Gourd', 'bitter_gourd', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Momordica charantia", "season": ["kharif", "summer"], "duration_days": 60}'),
('Ridge Gourd', 'ridge_gourd', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Luffa acutangula", "season": ["kharif", "summer"], "duration_days": 60}'),
('Snake Gourd', 'snake_gourd', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Trichosanthes cucumerina", "season": ["kharif", "summer"], "duration_days": 60}'),
('Pumpkin', 'pumpkin', '🎃', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Cucurbita maxima", "season": ["kharif"], "duration_days": 90}'),
('Cucumber', 'cucumber', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Cucumis sativus", "season": ["kharif", "summer"], "duration_days": 50}'),
('Capsicum', 'capsicum', '🫑', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Capsicum annuum", "season": ["kharif", "rabi"], "duration_days": 75}'),
('Chilli', 'chilli', '🌶️', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Capsicum annuum", "season": ["kharif", "rabi"], "duration_days": 90}'),
('Garlic', 'garlic', '🧄', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Allium sativum", "season": ["rabi"], "duration_days": 120}'),
('Lettuce', 'lettuce', '🥬', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Lactuca sativa", "season": ["rabi"], "duration_days": 60}'),
('Fenugreek (Methi)', 'fenugreek', '🌿', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Trigonella foenum-graecum", "season": ["rabi"], "duration_days": 25}'),
('Coriander', 'coriander_veg', '🌿', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Coriandrum sativum", "season": ["rabi"], "duration_days": 40}'),
('Drumstick', 'drumstick', '🌱', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Moringa oleifera", "season": ["perennial"], "duration_days": 160}'),
('Ash Gourd', 'ash_gourd', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Benincasa hispida", "season": ["kharif"], "duration_days": 90}'),
('Ivy Gourd', 'ivy_gourd', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Coccinia grandis", "season": ["perennial"], "duration_days": 60}'),
('Pointed Gourd', 'pointed_gourd', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Trichosanthes dioica", "season": ["kharif"], "duration_days": 120}'),
('Tinda', 'tinda', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Praecitrullus fistulosus", "season": ["kharif"], "duration_days": 60}'),
('Cluster Beans (Vegetable)', 'cluster_beans_veg', '🥒', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Cyamopsis tetragonoloba", "season": ["kharif"], "duration_days": 45}');

-- FRUITS (all fruits...)
INSERT INTO crops (label, value, icon, crop_group_id, metadata) VALUES
('Mango', 'mango', '🥭', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Mangifera indica", "season": ["perennial"], "duration_days": 1825}'),
('Banana', 'banana', '🍌', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Musa paradisiaca", "season": ["perennial"], "duration_days": 365}'),
('Apple', 'apple', '🍎', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Malus domestica", "season": ["perennial"], "duration_days": 1460}'),
('Orange', 'orange', '🍊', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Citrus sinensis", "season": ["perennial"], "duration_days": 1095}'),
('Grapes', 'grapes', '🍇', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Vitis vinifera", "season": ["perennial"], "duration_days": 1095}'),
('Pomegranate', 'pomegranate', '🟥', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Punica granatum", "season": ["perennial"], "duration_days": 1095}'),
('Guava', 'guava', '🟢', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Psidium guajava", "season": ["perennial"], "duration_days": 730}'),
('Papaya', 'papaya', '🟠', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Carica papaya", "season": ["perennial"], "duration_days": 270}'),
('Watermelon', 'watermelon', '🍉', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Citrullus lanatus", "season": ["summer"], "duration_days": 80}'),
('Muskmelon', 'muskmelon', '🍈', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Cucumis melo", "season": ["summer"], "duration_days": 75}'),
('Pineapple', 'pineapple', '🍍', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Ananas comosus", "season": ["perennial"], "duration_days": 540}'),
('Lemon', 'lemon', '🍋', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Citrus limon", "season": ["perennial"], "duration_days": 1095}'),
('Sweet Lime', 'sweet_lime', '🍋', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Citrus limetta", "season": ["perennial"], "duration_days": 1095}'),
('Sapota (Chikoo)', 'sapota', '🟤', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Manilkara zapota", "season": ["perennial"], "duration_days": 2555}'),
('Custard Apple', 'custard_apple', '🟢', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Annona reticulata", "season": ["perennial"], "duration_days": 1095}'),
('Jackfruit', 'jackfruit', '🟡', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Artocarpus heterophyllus", "season": ["perennial"], "duration_days": 2555}'),
('Strawberry', 'strawberry', '🍓', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Fragaria × ananassa", "season": ["rabi"], "duration_days": 90}'),
('Litchi', 'litchi', '🟤', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Litchi chinensis", "season": ["perennial"], "duration_days": 2555}'),
('Peach', 'peach', '🍑', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Prunus persica", "season": ["perennial"], "duration_days": 1095}'),
('Pear', 'pear', '🍐', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Pyrus communis", "season": ["perennial"], "duration_days": 1460}'),
('Plum', 'plum', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Prunus domestica", "season": ["perennial"], "duration_days": 1095}'),
('Apricot', 'apricot', '🟠', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Prunus armeniaca", "season": ["perennial"], "duration_days": 1095}'),
('Cherry', 'cherry', '🍒', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Prunus avium", "season": ["perennial"], "duration_days": 1460}'),
('Dragon Fruit', 'dragon_fruit', '🐉', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Hylocereus undatus", "season": ["perennial"], "duration_days": 365}'),
('Kiwi', 'kiwi', '🥝', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Actinidia deliciosa", "season": ["perennial"], "duration_days": 1825}'),
('Avocado', 'avocado', '🥑', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Persea americana", "season": ["perennial"], "duration_days": 1825}'),
('Passion Fruit', 'passion_fruit', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Passiflora edulis", "season": ["perennial"], "duration_days": 540}'),
('Fig', 'fig', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Ficus carica", "season": ["perennial"], "duration_days": 1095}'),
('Jamun', 'jamun', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Syzygium cumini", "season": ["perennial"], "duration_days": 2555}'),
('Amla', 'amla', '🟢', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Phyllanthus emblica", "season": ["perennial"], "duration_days": 2555}'),
('Ber', 'ber', '🟤', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Ziziphus mauritiana", "season": ["perennial"], "duration_days": 1095}'),
('Bael', 'bael', '🟢', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Aegle marmelos", "season": ["perennial"], "duration_days": 2555}'),
('Wood Apple', 'wood_apple', '🟤', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Limonia acidissima", "season": ["perennial"], "duration_days": 2555}'),
('Karonda', 'karonda', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Carissa carandas", "season": ["perennial"], "duration_days": 730}'),
('Phalsa', 'phalsa', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Grewia asiatica", "season": ["perennial"], "duration_days": 730}'),
('Mulberry', 'mulberry', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Morus alba", "season": ["perennial"], "duration_days": 1825}'),
('Kokum Fruit', 'kokum_fruit', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Garcinia indica", "season": ["perennial"], "duration_days": 2555}'),
('Rambutan', 'rambutan', '🔴', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Nephelium lappaceum", "season": ["perennial"], "duration_days": 2555}'),
('Mangosteen', 'mangosteen', '🟣', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Garcinia mangostana", "season": ["perennial"], "duration_days": 3650}'),
('Durian', 'durian', '🟡', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Durio zibethinus", "season": ["perennial"], "duration_days": 2555}'),
('Breadfruit', 'breadfruit', '🟢', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Artocarpus altilis", "season": ["perennial"], "duration_days": 1825}');

-- I'll continue with the remaining categories to avoid character limit...
-- Get final summary
SELECT 
  cg.group_name, 
  cg.display_order,
  COUNT(c.id) as crop_count 
FROM crop_groups cg
LEFT JOIN crops c ON c.crop_group_id = cg.id
GROUP BY cg.group_name, cg.display_order
ORDER BY cg.display_order;