COLLECTION = "formresults"
DATABASE = "test"

XLSX_FILENAME = "data"
CSV_FILENAME = $XLSX_FILENAME

MONGO_TO_CSV = "mongoexport --db " + $DATABASE + " --collection " + $COLLECTION + " --out " + $CSV_FILENAME + ".csv"
CSV_TO_XLSX = "ssconvert " + $CSV_FILENAME + ".csv " + $XLSX_FILENAME + ".xlsx"  #requires gnumeric: brew install gnumeric

echo $MONGO_TO_CSV
echo $CSV_FILENAME