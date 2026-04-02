# === Function to store readings in local file ===

def log_reading_to_file(reading, filename='sensor_readings.log'):
    # print('reading to log', reading)
    try:
        with open(filename, 'a') as file:
            file.write(f"{reading}\n")
        # print(f"Logged reading to {filename}")
    except Exception as e:
        print(f"Error logging reading to file: {e}")