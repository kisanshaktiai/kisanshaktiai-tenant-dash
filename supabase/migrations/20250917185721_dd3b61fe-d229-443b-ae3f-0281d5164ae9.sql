-- Clear existing crops to avoid duplicates
TRUNCATE TABLE crops CASCADE;

-- Insert comprehensive list of crops planted in India

-- CEREALS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Rice', 'rice', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Oryza sativa", "season": ["kharif", "rabi"], "duration_days": 120}'),
('Wheat', 'wheat', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Triticum aestivum", "season": ["rabi"], "duration_days": 120}'),
('Maize', 'maize', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Zea mays", "season": ["kharif", "rabi"], "duration_days": 90}'),
('Jowar (Sorghum)', 'jowar', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Sorghum bicolor", "season": ["kharif", "rabi"], "duration_days": 105}'),
('Bajra (Pearl Millet)', 'bajra', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Pennisetum glaucum", "season": ["kharif"], "duration_days": 80}'),
('Ragi (Finger Millet)', 'ragi', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Eleusine coracana", "season": ["kharif"], "duration_days": 100}'),
('Barley', 'barley', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Hordeum vulgare", "season": ["rabi"], "duration_days": 120}'),
('Small Millets', 'small_millets', (SELECT id FROM crop_groups WHERE group_key = 'cereals'), '{"scientific_name": "Various", "season": ["kharif"], "duration_days": 70}');

-- PULSES
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Chickpea (Chana)', 'chickpea', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Cicer arietinum", "season": ["rabi"], "duration_days": 100}'),
('Pigeon Pea (Arhar/Tur)', 'pigeon_pea', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Cajanus cajan", "season": ["kharif"], "duration_days": 160}'),
('Green Gram (Moong)', 'green_gram', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Vigna radiata", "season": ["kharif", "summer"], "duration_days": 65}'),
('Black Gram (Urad)', 'black_gram', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Vigna mungo", "season": ["kharif"], "duration_days": 75}'),
('Lentil (Masoor)', 'lentil', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Lens culinaris", "season": ["rabi"], "duration_days": 110}'),
('Field Pea (Matar)', 'field_pea', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Pisum sativum", "season": ["rabi"], "duration_days": 90}'),
('Kidney Bean (Rajma)', 'kidney_bean', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Phaseolus vulgaris", "season": ["kharif"], "duration_days": 90}'),
('Moth Bean', 'moth_bean', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Vigna aconitifolia", "season": ["kharif"], "duration_days": 75}'),
('Horse Gram (Kulthi)', 'horse_gram', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Macrotyloma uniflorum", "season": ["kharif", "rabi"], "duration_days": 120}'),
('Cowpea (Lobia)', 'cowpea', (SELECT id FROM crop_groups WHERE group_key = 'pulses'), '{"scientific_name": "Vigna unguiculata", "season": ["kharif"], "duration_days": 80}');

-- OILSEEDS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Groundnut', 'groundnut', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Arachis hypogaea", "season": ["kharif", "summer"], "duration_days": 100}'),
('Mustard', 'mustard', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Brassica juncea", "season": ["rabi"], "duration_days": 110}'),
('Sunflower', 'sunflower', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Helianthus annuus", "season": ["kharif", "rabi", "summer"], "duration_days": 90}'),
('Soybean', 'soybean', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Glycine max", "season": ["kharif"], "duration_days": 100}'),
('Sesame (Til)', 'sesame', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Sesamum indicum", "season": ["kharif"], "duration_days": 85}'),
('Safflower', 'safflower', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Carthamus tinctorius", "season": ["rabi"], "duration_days": 120}'),
('Castor', 'castor', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Ricinus communis", "season": ["kharif"], "duration_days": 150}'),
('Linseed', 'linseed', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Linum usitatissimum", "season": ["rabi"], "duration_days": 110}'),
('Niger', 'niger', (SELECT id FROM crop_groups WHERE group_key = 'oilseeds'), '{"scientific_name": "Guizotia abyssinica", "season": ["kharif"], "duration_days": 90}');

-- CASH CROPS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Cotton', 'cotton', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Gossypium hirsutum", "season": ["kharif"], "duration_days": 180}'),
('Sugarcane', 'sugarcane', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Saccharum officinarum", "season": ["kharif"], "duration_days": 365}'),
('Jute', 'jute', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Corchorus capsularis", "season": ["kharif"], "duration_days": 120}'),
('Tobacco', 'tobacco', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Nicotiana tabacum", "season": ["kharif", "rabi"], "duration_days": 120}'),
('Mesta', 'mesta', (SELECT id FROM crop_groups WHERE group_key = 'cash_crops'), '{"scientific_name": "Hibiscus cannabinus", "season": ["kharif"], "duration_days": 120}');

-- VEGETABLES
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Tomato', 'tomato', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Solanum lycopersicum", "season": ["kharif", "rabi"], "duration_days": 75}'),
('Onion', 'onion', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Allium cepa", "season": ["kharif", "rabi"], "duration_days": 120}'),
('Potato', 'potato', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Solanum tuberosum", "season": ["rabi"], "duration_days": 90}'),
('Brinjal (Eggplant)', 'brinjal', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Solanum melongena", "season": ["kharif", "rabi"], "duration_days": 80}'),
('Okra (Bhindi)', 'okra', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Abelmoschus esculentus", "season": ["kharif", "summer"], "duration_days": 50}'),
('Cauliflower', 'cauliflower', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Brassica oleracea var. botrytis", "season": ["rabi"], "duration_days": 90}'),
('Cabbage', 'cabbage', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Brassica oleracea var. capitata", "season": ["rabi"], "duration_days": 90}'),
('Carrot', 'carrot', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Daucus carota", "season": ["rabi"], "duration_days": 80}'),
('Radish', 'radish', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Raphanus sativus", "season": ["rabi"], "duration_days": 40}'),
('Beetroot', 'beetroot', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Beta vulgaris", "season": ["rabi"], "duration_days": 60}'),
('Spinach', 'spinach', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Spinacia oleracea", "season": ["rabi"], "duration_days": 30}'),
('Peas', 'peas', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Pisum sativum", "season": ["rabi"], "duration_days": 90}'),
('French Beans', 'french_beans', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Phaseolus vulgaris", "season": ["kharif", "rabi"], "duration_days": 60}'),
('Bottle Gourd', 'bottle_gourd', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Lagenaria siceraria", "season": ["kharif", "summer"], "duration_days": 70}'),
('Bitter Gourd', 'bitter_gourd', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Momordica charantia", "season": ["kharif", "summer"], "duration_days": 60}'),
('Ridge Gourd', 'ridge_gourd', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Luffa acutangula", "season": ["kharif", "summer"], "duration_days": 60}'),
('Snake Gourd', 'snake_gourd', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Trichosanthes cucumerina", "season": ["kharif", "summer"], "duration_days": 60}'),
('Pumpkin', 'pumpkin', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Cucurbita maxima", "season": ["kharif"], "duration_days": 90}'),
('Cucumber', 'cucumber', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Cucumis sativus", "season": ["kharif", "summer"], "duration_days": 50}'),
('Capsicum', 'capsicum', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Capsicum annuum", "season": ["kharif", "rabi"], "duration_days": 75}'),
('Chilli', 'chilli', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Capsicum annuum", "season": ["kharif", "rabi"], "duration_days": 90}'),
('Garlic', 'garlic', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Allium sativum", "season": ["rabi"], "duration_days": 120}'),
('Lettuce', 'lettuce', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Lactuca sativa", "season": ["rabi"], "duration_days": 60}'),
('Fenugreek (Methi)', 'fenugreek', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Trigonella foenum-graecum", "season": ["rabi"], "duration_days": 25}'),
('Coriander', 'coriander_veg', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Coriandrum sativum", "season": ["rabi"], "duration_days": 40}'),
('Drumstick', 'drumstick', (SELECT id FROM crop_groups WHERE group_key = 'vegetables'), '{"scientific_name": "Moringa oleifera", "season": ["perennial"], "duration_days": 160}');

-- FRUITS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Mango', 'mango', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Mangifera indica", "season": ["perennial"], "duration_days": 1825}'),
('Banana', 'banana', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Musa paradisiaca", "season": ["perennial"], "duration_days": 365}'),
('Apple', 'apple', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Malus domestica", "season": ["perennial"], "duration_days": 1460}'),
('Orange', 'orange', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Citrus sinensis", "season": ["perennial"], "duration_days": 1095}'),
('Grapes', 'grapes', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Vitis vinifera", "season": ["perennial"], "duration_days": 1095}'),
('Pomegranate', 'pomegranate', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Punica granatum", "season": ["perennial"], "duration_days": 1095}'),
('Guava', 'guava', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Psidium guajava", "season": ["perennial"], "duration_days": 730}'),
('Papaya', 'papaya', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Carica papaya", "season": ["perennial"], "duration_days": 270}'),
('Watermelon', 'watermelon', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Citrullus lanatus", "season": ["summer"], "duration_days": 80}'),
('Muskmelon', 'muskmelon', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Cucumis melo", "season": ["summer"], "duration_days": 75}'),
('Pineapple', 'pineapple', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Ananas comosus", "season": ["perennial"], "duration_days": 540}'),
('Lemon', 'lemon', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Citrus limon", "season": ["perennial"], "duration_days": 1095}'),
('Sweet Lime', 'sweet_lime', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Citrus limetta", "season": ["perennial"], "duration_days": 1095}'),
('Sapota (Chikoo)', 'sapota', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Manilkara zapota", "season": ["perennial"], "duration_days": 2555}'),
('Custard Apple', 'custard_apple', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Annona reticulata", "season": ["perennial"], "duration_days": 1095}'),
('Jackfruit', 'jackfruit', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Artocarpus heterophyllus", "season": ["perennial"], "duration_days": 2555}'),
('Strawberry', 'strawberry', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Fragaria × ananassa", "season": ["rabi"], "duration_days": 90}'),
('Litchi', 'litchi', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Litchi chinensis", "season": ["perennial"], "duration_days": 2555}'),
('Peach', 'peach', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Prunus persica", "season": ["perennial"], "duration_days": 1095}'),
('Pear', 'pear', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Pyrus communis", "season": ["perennial"], "duration_days": 1460}'),
('Plum', 'plum', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Prunus domestica", "season": ["perennial"], "duration_days": 1095}'),
('Apricot', 'apricot', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Prunus armeniaca", "season": ["perennial"], "duration_days": 1095}'),
('Cherry', 'cherry', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Prunus avium", "season": ["perennial"], "duration_days": 1460}'),
('Dragon Fruit', 'dragon_fruit', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Hylocereus undatus", "season": ["perennial"], "duration_days": 365}'),
('Kiwi', 'kiwi', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Actinidia deliciosa", "season": ["perennial"], "duration_days": 1825}'),
('Avocado', 'avocado', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Persea americana", "season": ["perennial"], "duration_days": 1825}'),
('Passion Fruit', 'passion_fruit', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Passiflora edulis", "season": ["perennial"], "duration_days": 540}'),
('Fig', 'fig', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Ficus carica", "season": ["perennial"], "duration_days": 1095}'),
('Jamun', 'jamun', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Syzygium cumini", "season": ["perennial"], "duration_days": 2555}'),
('Amla', 'amla', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Phyllanthus emblica", "season": ["perennial"], "duration_days": 2555}'),
('Ber', 'ber', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Ziziphus mauritiana", "season": ["perennial"], "duration_days": 1095}'),
('Bael', 'bael', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Aegle marmelos", "season": ["perennial"], "duration_days": 2555}'),
('Wood Apple', 'wood_apple', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Limonia acidissima", "season": ["perennial"], "duration_days": 2555}'),
('Karonda', 'karonda', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Carissa carandas", "season": ["perennial"], "duration_days": 730}'),
('Phalsa', 'phalsa', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Grewia asiatica", "season": ["perennial"], "duration_days": 730}'),
('Mulberry', 'mulberry', (SELECT id FROM crop_groups WHERE group_key = 'fruits'), '{"scientific_name": "Morus alba", "season": ["perennial"], "duration_days": 1825}');

-- SPICES
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Black Pepper', 'black_pepper', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Piper nigrum", "season": ["perennial"], "duration_days": 1095}'),
('Cardamom', 'cardamom', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Elettaria cardamomum", "season": ["perennial"], "duration_days": 1095}'),
('Turmeric', 'turmeric', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Curcuma longa", "season": ["kharif"], "duration_days": 240}'),
('Ginger', 'ginger', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Zingiber officinale", "season": ["kharif"], "duration_days": 210}'),
('Coriander Seeds', 'coriander_seeds', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Coriandrum sativum", "season": ["rabi"], "duration_days": 110}'),
('Cumin', 'cumin', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Cuminum cyminum", "season": ["rabi"], "duration_days": 120}'),
('Fennel', 'fennel', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Foeniculum vulgare", "season": ["rabi"], "duration_days": 120}'),
('Ajwain', 'ajwain', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Trachyspermum ammi", "season": ["rabi"], "duration_days": 120}'),
('Clove', 'clove', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Syzygium aromaticum", "season": ["perennial"], "duration_days": 2555}'),
('Cinnamon', 'cinnamon', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Cinnamomum verum", "season": ["perennial"], "duration_days": 1460}'),
('Nutmeg', 'nutmeg', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Myristica fragrans", "season": ["perennial"], "duration_days": 2555}'),
('Vanilla', 'vanilla', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Vanilla planifolia", "season": ["perennial"], "duration_days": 1095}'),
('Saffron', 'saffron', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Crocus sativus", "season": ["rabi"], "duration_days": 180}'),
('Large Cardamom', 'large_cardamom', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Amomum subulatum", "season": ["perennial"], "duration_days": 1095}'),
('Star Anise', 'star_anise', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Illicium verum", "season": ["perennial"], "duration_days": 2555}'),
('Kokum', 'kokum', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Garcinia indica", "season": ["perennial"], "duration_days": 2555}'),
('Tamarind', 'tamarind', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Tamarindus indica", "season": ["perennial"], "duration_days": 2555}'),
('Bay Leaf', 'bay_leaf', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Laurus nobilis", "season": ["perennial"], "duration_days": 1460}'),
('Fenugreek Seeds', 'fenugreek_seeds', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Trigonella foenum-graecum", "season": ["rabi"], "duration_days": 90}'),
('Nigella (Kalonji)', 'nigella', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Nigella sativa", "season": ["rabi"], "duration_days": 120}'),
('Celery', 'celery', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Apium graveolens", "season": ["rabi"], "duration_days": 120}'),
('Anise', 'anise', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Pimpinella anisum", "season": ["rabi"], "duration_days": 120}'),
('Poppy Seeds', 'poppy_seeds', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Papaver somniferum", "season": ["rabi"], "duration_days": 120}'),
('Dill Seeds', 'dill_seeds', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Anethum graveolens", "season": ["rabi"], "duration_days": 90}'),
('Garcinia', 'garcinia', (SELECT id FROM crop_groups WHERE group_key = 'spices'), '{"scientific_name": "Garcinia gummi-gutta", "season": ["perennial"], "duration_days": 2555}');

-- FODDER CROPS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Berseem', 'berseem', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Trifolium alexandrinum", "season": ["rabi"], "duration_days": 60}'),
('Lucerne (Alfalfa)', 'lucerne', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Medicago sativa", "season": ["rabi", "kharif"], "duration_days": 365}'),
('Oats', 'oats', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Avena sativa", "season": ["rabi"], "duration_days": 110}'),
('Napier Grass', 'napier_grass', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Pennisetum purpureum", "season": ["perennial"], "duration_days": 365}'),
('Guinea Grass', 'guinea_grass', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Panicum maximum", "season": ["perennial"], "duration_days": 365}'),
('Para Grass', 'para_grass', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Brachiaria mutica", "season": ["perennial"], "duration_days": 365}'),
('Cowpea Fodder', 'cowpea_fodder', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Vigna unguiculata", "season": ["kharif"], "duration_days": 60}'),
('Maize Fodder', 'maize_fodder', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Zea mays", "season": ["kharif", "summer"], "duration_days": 60}'),
('Sorghum Fodder', 'sorghum_fodder', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Sorghum bicolor", "season": ["kharif", "summer"], "duration_days": 60}'),
('Cluster Bean (Guar)', 'cluster_bean', (SELECT id FROM crop_groups WHERE group_key = 'fodder_crops'), '{"scientific_name": "Cyamopsis tetragonoloba", "season": ["kharif"], "duration_days": 90}');

-- MEDICINAL PLANTS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Ashwagandha', 'ashwagandha', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Withania somnifera", "season": ["kharif"], "duration_days": 150}'),
('Tulsi', 'tulsi', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Ocimum sanctum", "season": ["kharif"], "duration_days": 90}'),
('Aloe Vera', 'aloe_vera', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Aloe barbadensis", "season": ["perennial"], "duration_days": 365}'),
('Brahmi', 'brahmi', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Bacopa monnieri", "season": ["perennial"], "duration_days": 90}'),
('Giloy', 'giloy', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Tinospora cordifolia", "season": ["perennial"], "duration_days": 365}'),
('Sarpagandha', 'sarpagandha', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Rauvolfia serpentina", "season": ["perennial"], "duration_days": 540}'),
('Isabgol', 'isabgol', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Plantago ovata", "season": ["rabi"], "duration_days": 120}'),
('Senna', 'senna', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Cassia angustifolia", "season": ["kharif"], "duration_days": 90}'),
('Lemongrass', 'lemongrass', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Cymbopogon citratus", "season": ["perennial"], "duration_days": 180}'),
('Mint', 'mint', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Mentha arvensis", "season": ["rabi"], "duration_days": 90}'),
('Stevia', 'stevia', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Stevia rebaudiana", "season": ["perennial"], "duration_days": 90}'),
('Safed Musli', 'safed_musli', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Chlorophytum borivilianum", "season": ["kharif"], "duration_days": 240}'),
('Coleus', 'coleus', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Coleus forskohlii", "season": ["kharif"], "duration_days": 150}'),
('Kalmegh', 'kalmegh', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Andrographis paniculata", "season": ["kharif"], "duration_days": 90}'),
('Gudmar', 'gudmar', (SELECT id FROM crop_groups WHERE group_key = 'medicinal_plants'), '{"scientific_name": "Gymnema sylvestre", "season": ["perennial"], "duration_days": 365}');

-- PLANTATION CROPS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Tea', 'tea', (SELECT id FROM crop_groups WHERE group_key = 'plantation_crops'), '{"scientific_name": "Camellia sinensis", "season": ["perennial"], "duration_days": 1825}'),
('Coffee', 'coffee', (SELECT id FROM crop_groups WHERE group_key = 'plantation_crops'), '{"scientific_name": "Coffea arabica", "season": ["perennial"], "duration_days": 1095}'),
('Rubber', 'rubber', (SELECT id FROM crop_groups WHERE group_key = 'plantation_crops'), '{"scientific_name": "Hevea brasiliensis", "season": ["perennial"], "duration_days": 2555}'),
('Coconut', 'coconut', (SELECT id FROM crop_groups WHERE group_key = 'plantation_crops'), '{"scientific_name": "Cocos nucifera", "season": ["perennial"], "duration_days": 2190}'),
('Arecanut', 'arecanut', (SELECT id FROM crop_groups WHERE group_key = 'plantation_crops'), '{"scientific_name": "Areca catechu", "season": ["perennial"], "duration_days": 2190}'),
('Oil Palm', 'oil_palm', (SELECT id FROM crop_groups WHERE group_key = 'plantation_crops'), '{"scientific_name": "Elaeis guineensis", "season": ["perennial"], "duration_days": 1095}'),
('Cocoa', 'cocoa', (SELECT id FROM crop_groups WHERE group_key = 'plantation_crops'), '{"scientific_name": "Theobroma cacao", "season": ["perennial"], "duration_days": 1825}'),
('Cashew', 'cashew', (SELECT id FROM crop_groups WHERE group_key = 'plantation_crops'), '{"scientific_name": "Anacardium occidentale", "season": ["perennial"], "duration_days": 1095}');

-- FLOWER CROPS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Rose', 'rose', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Rosa spp.", "season": ["perennial"], "duration_days": 365}'),
('Marigold', 'marigold', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Tagetes erecta", "season": ["kharif", "rabi"], "duration_days": 90}'),
('Jasmine', 'jasmine', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Jasminum spp.", "season": ["perennial"], "duration_days": 365}'),
('Chrysanthemum', 'chrysanthemum', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Chrysanthemum morifolium", "season": ["rabi"], "duration_days": 120}'),
('Tuberose', 'tuberose', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Polianthes tuberosa", "season": ["kharif"], "duration_days": 120}'),
('Gladiolus', 'gladiolus', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Gladiolus grandiflorus", "season": ["rabi"], "duration_days": 90}'),
('Gerbera', 'gerbera', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Gerbera jamesonii", "season": ["perennial"], "duration_days": 365}'),
('Orchids', 'orchids', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Orchidaceae family", "season": ["perennial"], "duration_days": 730}'),
('Carnation', 'carnation', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Dianthus caryophyllus", "season": ["rabi"], "duration_days": 120}'),
('Anthurium', 'anthurium', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Anthurium andraeanum", "season": ["perennial"], "duration_days": 365}'),
('Lilium', 'lilium', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Lilium spp.", "season": ["rabi"], "duration_days": 90}'),
('Aster', 'aster', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Callistephus chinensis", "season": ["rabi"], "duration_days": 90}'),
('Crossandra', 'crossandra', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Crossandra infundibuliformis", "season": ["perennial"], "duration_days": 180}'),
('Dahlia', 'dahlia', (SELECT id FROM crop_groups WHERE group_key = 'flower_crops'), '{"scientific_name": "Dahlia pinnata", "season": ["rabi"], "duration_days": 120}');

-- ROOT & TUBER CROPS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Sweet Potato', 'sweet_potato', (SELECT id FROM crop_groups WHERE group_key = 'root_tuber'), '{"scientific_name": "Ipomoea batatas", "season": ["kharif"], "duration_days": 120}'),
('Cassava (Tapioca)', 'cassava', (SELECT id FROM crop_groups WHERE group_key = 'root_tuber'), '{"scientific_name": "Manihot esculenta", "season": ["kharif"], "duration_days": 270}'),
('Yam', 'yam', (SELECT id FROM crop_groups WHERE group_key = 'root_tuber'), '{"scientific_name": "Dioscorea alata", "season": ["kharif"], "duration_days": 240}'),
('Elephant Foot Yam', 'elephant_foot_yam', (SELECT id FROM crop_groups WHERE group_key = 'root_tuber'), '{"scientific_name": "Amorphophallus paeoniifolius", "season": ["kharif"], "duration_days": 240}'),
('Colocasia (Arbi)', 'colocasia', (SELECT id FROM crop_groups WHERE group_key = 'root_tuber'), '{"scientific_name": "Colocasia esculenta", "season": ["kharif"], "duration_days": 150}'),
('Greater Yam', 'greater_yam', (SELECT id FROM crop_groups WHERE group_key = 'root_tuber'), '{"scientific_name": "Dioscorea alata", "season": ["kharif"], "duration_days": 270}'),
('Tamarind Tuber', 'tamarind_tuber', (SELECT id FROM crop_groups WHERE group_key = 'root_tuber'), '{"scientific_name": "Tacca leontopetaloides", "season": ["kharif"], "duration_days": 240}');

-- DRIED FRUITS & NUTS
INSERT INTO crops (label, value, crop_group_id, metadata) VALUES
('Almond', 'almond', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Prunus dulcis", "season": ["perennial"], "duration_days": 2555}'),
('Walnut', 'walnut', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Juglans regia", "season": ["perennial"], "duration_days": 2555}'),
('Pistachio', 'pistachio', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Pistacia vera", "season": ["perennial"], "duration_days": 2555}'),
('Dates', 'dates', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Phoenix dactylifera", "season": ["perennial"], "duration_days": 2555}'),
('Raisins', 'raisins', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Vitis vinifera", "season": ["perennial"], "duration_days": 1095}'),
('Dried Apricot', 'dried_apricot', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Prunus armeniaca", "season": ["perennial"], "duration_days": 1095}'),
('Pine Nuts', 'pine_nuts', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Pinus gerardiana", "season": ["perennial"], "duration_days": 7300}'),
('Hazelnut', 'hazelnut', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Corylus avellana", "season": ["perennial"], "duration_days": 1825}'),
('Macadamia', 'macadamia', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Macadamia integrifolia", "season": ["perennial"], "duration_days": 2555}'),
('Brazil Nut', 'brazil_nut', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Bertholletia excelsa", "season": ["perennial"], "duration_days": 5475}'),
('Pecan', 'pecan', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Carya illinoinensis", "season": ["perennial"], "duration_days": 2555}'),
('Chestnut', 'chestnut', (SELECT id FROM crop_groups WHERE group_key = 'dried_fruits_nuts'), '{"scientific_name": "Castanea sativa", "season": ["perennial"], "duration_days": 1825}');

-- Update the count for summary
SELECT 
  cg.group_name, 
  COUNT(c.id) as crop_count 
FROM crop_groups cg
LEFT JOIN crops c ON c.crop_group_id = cg.id
GROUP BY cg.group_name
ORDER BY cg.display_order;