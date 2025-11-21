import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent   # this = FlickMatch/app
file_path1=BASE_DIR / 'data' / 'final_dataset.csv'
file_path2=BASE_DIR / 'data' / 'tmdb_5000_movies.csv'
file_path3=BASE_DIR / 'data' / 'tmdb_5000_credits.csv'
df1= pd.read_csv(file_path1)
movies= pd.read_csv(file_path2)
df3= pd.read_csv(file_path3)
# print(df1.head())
# print(df2.head())
# print(df3.head())
movies=movies.merge(df3,on='title')
print(movies.head(1))