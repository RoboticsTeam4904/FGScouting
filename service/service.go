package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/user"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"golang.org/x/net/context"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/sheets/v4"
)

type googleOAuthTokenInfo struct {
	AZP           string `json:"azp"`
	AUD           string `json:"aud"`
	SUB           string `json:"sub"`
	Scope         string `json:"scope"`
	EXP           string `json:"exp"`
	ExpiresIn     string `json:"expires_in"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	AccessType    string `json:"access_type"`
}
type serviceBearerToken struct {
	user    string
	tExpiry int64
	token   [32]byte
}

var spreadsheetID string
var srv *sheets.Service
var tokenStore map[string]*serviceBearerToken

func getTokenInfo(token string, u *googleOAuthTokenInfo) error {
	tokeninfo, err := http.Get(fmt.Sprintf("https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=%s", token))
	if err != nil {
		return err
	}
	defer tokeninfo.Body.Close()
	bodyBytes := []byte{}
	if tokeninfo.StatusCode == http.StatusOK {
		bodyBytes, err = ioutil.ReadAll(tokeninfo.Body)
		if err != nil {
			return err
		}
	} else {
		return err
	}
	err = json.Unmarshal(bodyBytes, u)
	if err != nil {
		return err
	}
	return nil
}

func issueToken(w http.ResponseWriter, r *http.Request) {
	if len(r.URL.Query()["token"]) != 1 {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid query parameters",
		})
		return
	}
	userInfo := *new(googleOAuthTokenInfo)
	err := getTokenInfo(r.URL.Query()["token"][0], &userInfo)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid token specification or data",
		})
		return
	}
	if len(strings.Split(userInfo.Email, "@")) < 2 {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid user",
		})
		return
	}
	if strings.Split(userInfo.Email, "@")[1] != "nuevaschool.org" {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid user domain",
		})
		return
	}
	_token := make([]byte, 16)
	rand.Read(_token)
	_bytes := []byte(strconv.FormatInt(time.Now().UTC().UnixNano(), 10))
	hToken := sha256.Sum256(append(_token, _bytes[:]...))
	token := fmt.Sprintf("~%x", hToken)
	expiry := time.Now().UTC().Unix() + 86400
	for k, v := range tokenStore {
		if v.user == strings.Split(userInfo.Email, "@")[0] {
			delete(tokenStore, k)
		}
	}
	tokenStore[token] = &serviceBearerToken{
		user:    strings.Split(userInfo.Email, "@")[0],
		tExpiry: expiry,
		token:   hToken,
	}
	json.NewEncoder(w).Encode(map[string]string{
		"token":      token,
		"expires_at": strconv.FormatInt(expiry, 10),
	})
}

func checkToken(value string) bool {
	val, ok := tokenStore[value]
	if !ok {
		return false
	}
	if val.tExpiry <= time.Now().UTC().Unix() {
		delete(tokenStore, value)
		return false
	}
	return true
}

func verifyAuthString(value string) bool {
	if value[0] == '~' {
		if !checkToken(value) {
			return false
		}
	} else {
		userInfo := *new(googleOAuthTokenInfo)
		err := getTokenInfo(value, &userInfo)
		if err != nil {
			return false
		}
		if len(strings.Split(userInfo.Email, "@")) < 2 {
			return false
		}
		if strings.Split(userInfo.Email, "@")[1] != "nuevaschool.org" {
			return false
		}
	}
	return true
}

func getQuestions(w http.ResponseWriter, r *http.Request) {
	if len(r.URL.Query()["token"]) != 1 {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid query parameters",
		})
		return
	}
	if !verifyAuthString(r.URL.Query()["token"][0]) {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Bad token, user specifier, etc.",
		})
		return
	}
	readRange := "Questions"
	resp, err := srv.Spreadsheets.Values.Get(spreadsheetID, readRange).Do()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Failed to get data from sheets",
		})
		return
	}
	if len(resp.Values) > 0 {
		json.NewEncoder(w).Encode(resp.Values)
	} else {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "No data",
		})
		return
	}
}

func getResponses(w http.ResponseWriter, r *http.Request) {
	if len(r.URL.Query()["token"]) != 1 {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid query parameters",
		})
		return
	}
	if !verifyAuthString(r.URL.Query()["token"][0]) {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Bad token, user specifier, etc.",
		})
		return
	}
	readRange := "Responses"
	resp, err := srv.Spreadsheets.Values.Get(spreadsheetID, readRange).Do()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Failed to get data from sheets",
		})
		return
	}
	if len(resp.Values) > 0 {
		json.NewEncoder(w).Encode(resp.Values)
	} else {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "No data",
		})
		return
	}
}

func postResponses(w http.ResponseWriter, r *http.Request){
	values = r.FormValue("values")
	if len(r.URL.Query()["token"]) != 1 { // TODO: Could make this a function
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid query parameters",
		})
		return
	}
	if !verifyAuthString(r.URL.Query()["token"][0]) {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Bad token, user specifier, etc.",
		})
		return
	}
	readRange := "Responses"
	resp, err := srv.Spreadsheets.Values.Get(spreadsheetID, readRange).Do()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Failed to get data from sheets",
		})
		return
	} 
	writeRange := "Responses!"
	if len(resp.Values) > 0 {
		writeRange = writeRange + "A" + strconv.Itoa(len(resp.Values)+1)
	} else {
		writeRange = writeRange + "A1"
	}
	rb := &sheets,ValueRange{
		"values": values,
		"range": writeRange
	}
	resp, err := srv.Spreadsheets.Values.Update(spreadsheetId, writeRange, rb).Do()
	if err != nil {
		log.Fatal(err)
	}
}

func getClient(ctx context.Context, config *oauth2.Config) *http.Client {
	cacheFile, err := tokenCacheFile()
	if err != nil {
		log.Fatalf("Unable to get path to cached credential file. %v", err)
	}
	tok, err := tokenFromFile(cacheFile)
	if err != nil {
		tok = getTokenFromWeb(config)
		saveToken(cacheFile, tok)
	}
	return config.Client(ctx, tok)
}

func getTokenFromWeb(config *oauth2.Config) *oauth2.Token {
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	fmt.Printf("Go to the following link in your browser then type the "+
		"authorization code: \n%v\n", authURL)

	var code string
	if _, err := fmt.Scan(&code); err != nil {
		log.Fatalf("Unable to read authorization code %v", err)
	}

	tok, err := config.Exchange(oauth2.NoContext, code)
	if err != nil {
		log.Fatalf("Unable to retrieve token from web %v", err)
	}
	return tok
}

func tokenCacheFile() (string, error) {
	usr, err := user.Current()
	if err != nil {
		return "", err
	}
	tokenCacheDir := filepath.Join(usr.HomeDir, ".credentials")
	os.MkdirAll(tokenCacheDir, 0700)
	return filepath.Join(tokenCacheDir,
		url.QueryEscape("sheets.googleapis.com-fgscouting-backend.json")), err
}

func tokenFromFile(file string) (*oauth2.Token, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	t := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(t)
	defer f.Close()
	return t, err
}

func saveToken(file string, token *oauth2.Token) {
	fmt.Printf("Saving credential file to: %s\n", file)
	f, err := os.OpenFile(file, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("Unable to cache oauth token: %v", err)
	}
	defer f.Close()
	json.NewEncoder(f).Encode(token)
}

func main() {
	spreadsheetID = "17HY8J_bdG5IcM9YIUYaZts3OorVd9TvavfLLpSoKkwY"
	tokenStore = map[string]*serviceBearerToken{}

	ctx := context.Background()

	usr, err := user.Current()
	if err != nil {
		log.Fatal("Cannot get current user", err)
	}
	b, err := ioutil.ReadFile(filepath.Join(usr.HomeDir, ".credentials", "secrets.json"))
	if err != nil {
		log.Fatalf("Unable to read client secret file: %v, please place your secrets in a file located at ~/.credentials/secrets.json", err)
	}

	config, err := google.ConfigFromJSON(b, "https://www.googleapis.com/auth/spreadsheets")
	if err != nil {
		log.Fatalf("Unable to parse client secret file to config: %v", err)
	}
	client := getClient(ctx, config)

	srv, err = sheets.New(client)
	if err != nil {
		log.Fatalf("Unable to retrieve Sheets Client %v", err)
	}

	router := mux.NewRouter()
	router.HandleFunc("/questions", getQuestions).Methods("GET")
	router.HandleFunc("/responses", getResponses).Methods("GET")
	router.HandleFunc("/postResponses", postResponses).Methods("PUT")
	router.HandleFunc("/token", issueToken).Methods("GET")
	log.Println("Starting server on *:8001")
	log.Fatal(http.ListenAndServe(":8001", router))
}
