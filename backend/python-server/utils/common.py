import pandas as pd
import json

def tranform_device_list(device_list):
    """
    Transforms the device list into a DataFrame with specific columns.
    
    Args:
        device_list (list): List of devices, where each device is a dictionary.
        
    Returns:
        pd.DataFrame: DataFrame containing the transformed device data.
    """
    # print(type(device_list), device_list)
    # print('tranform_device_list', list(device_list))
    # df = pd.DataFrame(device_list)
    # df.index = df['_id']  # Start index from 1
    # df = df[["device_name","device_type", "source_id", "unit", "status"]]  # Drop '_id' column if it exists
    # print('dfWithRequiredColumns\n', df, df['device_name'])
    
    # if not df.empty:
    #     df = df[['deviceId', 'deviceName', 'deviceType', 'deviceStatus']]
    # return df
