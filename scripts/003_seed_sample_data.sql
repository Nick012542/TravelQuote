-- Seed destinations
INSERT INTO public.destinations (name, description) VALUES
('Himachal Pradesh', 'Beautiful hill state with snow-capped mountains'),
('Kashmir', 'Paradise on Earth with stunning valleys'),
('Uttarakhand', 'Land of Gods with spiritual destinations'),
('Rajasthan', 'Royal state with forts and palaces'),
('Goa', 'Beach paradise with Portuguese heritage')
ON CONFLICT (name) DO NOTHING;

-- Seed places for Himachal Pradesh
INSERT INTO public.places (destination_id, name, description)
SELECT d.id, p.name, p.description
FROM public.destinations d
CROSS JOIN (VALUES
  ('Manali', 'Popular hill station with adventure activities'),
  ('Shimla', 'Queen of Hills - Colonial charm'),
  ('Kasol', 'Mini Israel - Backpacker paradise'),
  ('Dharamshala', 'Home of Dalai Lama'),
  ('Dalhousie', 'Scottish highlands of India'),
  ('Amritsar', 'Golden Temple city')
) AS p(name, description)
WHERE d.name = 'Himachal Pradesh'
ON CONFLICT DO NOTHING;

-- Seed places for Kashmir
INSERT INTO public.places (destination_id, name, description)
SELECT d.id, p.name, p.description
FROM public.destinations d
CROSS JOIN (VALUES
  ('Srinagar', 'Summer capital with Dal Lake'),
  ('Gulmarg', 'Meadow of flowers - Skiing destination'),
  ('Pahalgam', 'Valley of Shepherds'),
  ('Sonamarg', 'Meadow of Gold')
) AS p(name, description)
WHERE d.name = 'Kashmir'
ON CONFLICT DO NOTHING;

-- Seed places for Uttarakhand
INSERT INTO public.places (destination_id, name, description)
SELECT d.id, p.name, p.description
FROM public.destinations d
CROSS JOIN (VALUES
  ('Rishikesh', 'Yoga capital of the world'),
  ('Haridwar', 'Gateway to Gods'),
  ('Mussoorie', 'Queen of Hills'),
  ('Nainital', 'Lake District of India'),
  ('Auli', 'Skiing paradise')
) AS p(name, description)
WHERE d.name = 'Uttarakhand'
ON CONFLICT DO NOTHING;
