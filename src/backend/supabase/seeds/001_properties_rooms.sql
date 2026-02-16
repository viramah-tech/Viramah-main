-- =============================================
-- VIRAMAH: Development Seed Data
-- WARNING: Development use only — never run on production
-- =============================================

-- =============================================
-- 1. PROPERTIES (Seed Viramah Locations)
-- =============================================
INSERT INTO properties (id, name, address, city, state, pincode, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Viramah Heritage House', '42 MG Road, Koramangala', 'Bangalore', 'Karnataka', '560034', 'active'),
('22222222-2222-2222-2222-222222222222', 'Viramah Lake View', '15 Chapel Road, Indiranagar', 'Bangalore', 'Karnataka', '560038', 'active'),
('33333333-3333-3333-3333-333333333333', 'Viramah Campus Hub', '88 University Road, Aundh', 'Pune', 'Maharashtra', '411007', 'active');

-- =============================================
-- 2. ROOMS
-- =============================================
INSERT INTO rooms (id, property_id, room_number, type, floor, base_price, status, max_occupancy, description, images) VALUES
-- Heritage House
('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'HH-101', '1-seater', 1, 12000.00, 'available', 1, 'The Solo — A premium single room with study desk, natural lighting, and wardrobe.', '{}'),
('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'HH-102', '2-seater', 1, 8500.00, 'available', 2, 'The Duo — Shared living with privacy partitions, dual study areas, and AC.', '{}'),
('aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'HH-201', '3-seater', 2, 6500.00, 'available', 3, 'The Trio — Community living with individual storage and shared balcony.', '{}'),
-- Lake View
('bbbb1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'LV-101', '1-seater', 1, 15000.00, 'available', 1, 'Lake View Solo — Premium room with lake-facing window and en-suite bathroom.', '{}'),
('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'LV-102', '2-seater', 1, 10000.00, 'available', 2, 'Lake View Duo — Twin sharing with independent beds and study zones.', '{}'),
-- Campus Hub
('cccc1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'CH-101', '2-seater', 1, 7000.00, 'available', 2, 'Campus Duo — Budget-friendly twin share with AC and WiFi.', '{}'),
('cccc2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'CH-201', '4-seater', 2, 4500.00, 'available', 4, 'The Quad — Affordable quad sharing with common lounge access.', '{}');
