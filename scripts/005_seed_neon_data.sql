-- Seed destinations
INSERT INTO destinations (name, description) VALUES
('Himachal Pradesh', 'Beautiful hill state with snow-capped mountains'),
('Kashmir', 'Paradise on Earth with stunning valleys'),
('Uttarakhand', 'Land of Gods with spiritual destinations'),
('Rajasthan', 'Royal state with forts and palaces'),
('Goa', 'Beach paradise with Portuguese heritage')
ON CONFLICT (name) DO NOTHING;

-- Seed places for Himachal Pradesh
INSERT INTO places (destination_id, name, description)
SELECT d.id, p.name, p.description
FROM destinations d
CROSS JOIN (VALUES
  ('Manali', 'Popular hill station with adventure activities'),
  ('Shimla', 'Queen of Hills - Colonial charm'),
  ('Kasol', 'Mini Israel - Backpacker paradise'),
  ('Dharamshala', 'Home of Dalai Lama'),
  ('Dalhousie', 'Scottish highlands of India'),
  ('Amritsar', 'Golden Temple city')
) AS p(name, description)
WHERE d.name = 'Himachal Pradesh';

-- Seed places for Kashmir
INSERT INTO places (destination_id, name, description)
SELECT d.id, p.name, p.description
FROM destinations d
CROSS JOIN (VALUES
  ('Srinagar', 'Summer capital with Dal Lake'),
  ('Gulmarg', 'Meadow of flowers - Skiing destination'),
  ('Pahalgam', 'Valley of Shepherds'),
  ('Sonamarg', 'Meadow of Gold')
) AS p(name, description)
WHERE d.name = 'Kashmir';

-- Seed places for Uttarakhand
INSERT INTO places (destination_id, name, description)
SELECT d.id, p.name, p.description
FROM destinations d
CROSS JOIN (VALUES
  ('Rishikesh', 'Yoga capital of the world'),
  ('Haridwar', 'Gateway to Gods'),
  ('Mussoorie', 'Queen of Hills'),
  ('Nainital', 'Lake District of India'),
  ('Auli', 'Skiing paradise')
) AS p(name, description)
WHERE d.name = 'Uttarakhand';

-- Seed places for Rajasthan
INSERT INTO places (destination_id, name, description)
SELECT d.id, p.name, p.description
FROM destinations d
CROSS JOIN (VALUES
  ('Jaipur', 'Pink City - Royal heritage'),
  ('Udaipur', 'City of Lakes'),
  ('Jodhpur', 'Blue City'),
  ('Jaisalmer', 'Golden City in the desert')
) AS p(name, description)
WHERE d.name = 'Rajasthan';

-- Seed places for Goa
INSERT INTO places (destination_id, name, description)
SELECT d.id, p.name, p.description
FROM destinations d
CROSS JOIN (VALUES
  ('North Goa', 'Popular beaches and nightlife'),
  ('South Goa', 'Serene beaches and luxury resorts'),
  ('Old Goa', 'Portuguese churches and heritage')
) AS p(name, description)
WHERE d.name = 'Goa';

-- Seed some sample hotels
INSERT INTO hotels (place_id, name, category, room_type, price_per_night, price_ep, price_cp, price_map, price_ap, extra_adult_with_mattress, extra_child_without_mattress)
SELECT p.id, h.name, h.category, h.room_type, h.price_map, h.price_ep, h.price_cp, h.price_map, h.price_ap, h.extra_adult, h.extra_child
FROM places p
CROSS JOIN (VALUES
  ('Hotel Snow View', '3-star-basic', 'Deluxe Room', 2000, 2500, 3000, 3500, 800, 400),
  ('Mountain Retreat', '3-star-premium', 'Super Deluxe', 2500, 3000, 3500, 4000, 1000, 500),
  ('Luxury Heights', '4-star', 'Premium Suite', 4000, 4500, 5000, 5500, 1500, 700)
) AS h(name, category, room_type, price_ep, price_cp, price_map, price_ap, extra_adult, extra_child)
WHERE p.name = 'Manali';

-- Seed train prices
INSERT INTO train_prices (from_city, to_city, class, price_per_person) VALUES
('Delhi', 'Chandigarh', 'sleeper', 350),
('Delhi', 'Chandigarh', '3ac', 700),
('Delhi', 'Chandigarh', '2ac', 1100),
('Delhi', 'Chandigarh', '1ac', 1800),
('Delhi', 'Jammu', 'sleeper', 500),
('Delhi', 'Jammu', '3ac', 1000),
('Delhi', 'Jammu', '2ac', 1600),
('Delhi', 'Jammu', '1ac', 2500),
('Delhi', 'Haridwar', 'sleeper', 300),
('Delhi', 'Haridwar', '3ac', 600),
('Delhi', 'Haridwar', '2ac', 950),
('Delhi', 'Haridwar', '1ac', 1500)
ON CONFLICT (from_city, to_city, class) DO NOTHING;

-- Seed transport prices
INSERT INTO transport_prices (destination_id, vehicle_type, vehicle_name, capacity, price_per_day)
SELECT d.id, t.vehicle_type, t.vehicle_name, t.capacity, t.price_per_day
FROM destinations d
CROSS JOIN (VALUES
  ('car', 'Sedan (Swift Dzire)', 4, 2500),
  ('car', 'SUV (Innova)', 6, 4000),
  ('car', 'SUV (Innova Crysta)', 6, 4500),
  ('tempo_traveller', 'Tempo Traveller 12 Seater', 12, 5500),
  ('tempo_traveller', 'Tempo Traveller 17 Seater', 17, 6500),
  ('bus', 'Mini Bus 20 Seater', 20, 8000)
) AS t(vehicle_type, vehicle_name, capacity, price_per_day)
WHERE d.name = 'Himachal Pradesh';
