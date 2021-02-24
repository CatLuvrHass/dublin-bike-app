from xmlrpc.client import DateTime

"""Import Packages"""
from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import mysql.connector
import credentials
import requests
import json
import time
import datetime
import traceback
import sqlalchemy as sqla


def main():
    while True:
        try:
            """info req for api JCDeacux"""
            url = "https://api.jcdecaux.com/vls/v1/stations"
            base = "Dublin"
            apikey = "86e256748a1872c27d81d7f54516d214b19faa8e"
            current_time = datetime.datetime.now()
            filename = 'data_{}.json'.format(current_time).replace(" ", "_").replace(":", "_")

            r = requests.get(url, params={"apiKey": apikey, "contract": base})

            data = json.loads(r.text)
            store_data(data, filename)
            get_station(data)
            get_avail(data)

            time.sleep(5 * 60)
        except:
            print(traceback.format_exc())
    return


def get_bike_info():
    r = requests.get(
        "https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey""=86e256748a1872c27d81d7f54516d214b19faa8e")
    return r.json()


def store_data(data, filename):
    '''uploads the data to a json file called data_[X] where X is the time the json file was pulled from the API'''
    with open(filename, 'w') as f:
        f.write(str(data))
    return


# inserts table information into DB
"""Functions"""


def get_station(stations):
    """update the stations table and populate it with """
    print(type(stations), len(stations))
    for station in stations:
        print(station)
        vals = (station.get('address'),
                int(station.get('banking')),
                station.get('bike_stands'),
                int(station.get('bonus')),
                station.get('contract_name'),
                station.get('name'), station.get('number'),
                station.get('position').get('lat'),
                station.get('position').get('lng'),
                station.get('status'))
        engine.execute("insert into station values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", vals)
    return


def get_avail(available):
    """empty the contents of the availability table and repopulate it with updated values"""
    print(type(available), len(available))
    engine.execute("DELETE FROM availability")
    for entry in available:
        print(entry)
        vals = (entry.get('number'), int(entry.get('available_bikes')), int(entry.get('available_bike_stands')),
                entry.get('last_update'))
        engine.execute("insert into availability values(%s,%s,%s,%s)", vals)
    return


# makes a data and table
metadata = sqla.MetaData()
URI = "database-1.c8vtobqomn0w.us-east-1.rds.amazonaws.com"
DB = "dbikes2"
name = credentials.name
pw = credentials.password
"""Initate connection"""
engine = create_engine("mysql+mysqlconnector://{}:{}@{}:3306/{}".format(name, pw, URI, DB), echo=True)

connection = engine.connect()

engine.execute("CREATE DATABASE IF NOT EXISTS dbikes2")

R = engine.execute("SHOW DATABASES")
print(R)

"""Create Stations Table if none exists"""
sql = """
CREATE TABLE IF NOT EXISTS station(
address VARCHAR(256),
banking INTEGER,
bike_stands INTEGER,
bonus INTEGER,
contract_name VARCHAR(256),
name VARCHAR(256),
number INTEGER,
position_lat REAL,
position_lng REAL,
status VARCHAR(256)
)"""
try:
    res = engine.execute("DROP TABLE IF EXISTS station")
    res = engine.execute(sql)
    print(res.fetchall())

except Exception as e:
    print(e)

"""Create avaialbeilty table if none exists"""
sql = """
CREATE TABLE IF NOT EXISTS availability (
number INTEGER,
available_bikes INTEGER,
available_bike_stands INTEGER,
last_update INTEGER
)"""

try:
    res = engine.execute(sql)
    print(res.fetchall())

except Exception as e:
    print(e)

main()
