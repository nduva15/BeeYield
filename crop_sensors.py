from PIL import Image
import os

img_path = 'C:/Users/aggym/.gemini/antigravity/brain/077c11b8-3c16-4d6a-99b7-f85bfce1dae5/uploaded_media_1770052395602.png'
dest_dir = r'c:\Users\aggym\Downloads\Honey\public\images\products'

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

img = Image.open(img_path)
w, h = img.size

# Estimated grid coordinates based on 1024x398
# The cards are inside a larger white box.
# Left margin ~30px, Right margin ~30px
# Top of cards ~135px, Bottom ~375px
# Card width ~185px, Spacing ~10px

sensor_names = [
    ["beehub_hive_scale.png", "beehub_sound_sensor.png", "beehub_temp_sensor.png", "beehub_temp_humidity.png", "beehub_temp_humidity_co2.png"],
    ["beehub_weather_station.png", "beehub_sim_card.png", "beehub_bee_counter.png", "beehub_usb.png", "beehub_solar_panel.png"]
]

# Grid parameters
start_x = 35
start_y = 140
card_w = 185
card_h = 115
gap_x = 10
gap_y = 10

for row in range(2):
    for col in range(5):
        left = start_x + col * (card_w + gap_x)
        top = start_y + row * (card_h + gap_y)
        right = left + card_w
        bottom = top + card_h
        
        # Crop just the icon part if possible, or the whole card
        # Actually the icon is centered in the upper part of the card
        # Let's crop the whole card for now as it looks clean
        crop = img.crop((left, top, right, bottom))
        crop.save(os.path.join(dest_dir, sensor_names[row][col]))
        print(f"Saved {sensor_names[row][col]}")
