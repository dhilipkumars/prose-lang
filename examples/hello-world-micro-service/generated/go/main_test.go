package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
)

func TestSayHello(t *testing.T) {
	tests := []struct {
		name           string
		query          url.Values
		expectedStatus int
		expectedBody   string
	}{
		{
			name:           "Both names missing (Default)",
			query:          url.Values{},
			expectedStatus: http.StatusOK,
			expectedBody:   "Vanakam World",
		},
		{
			name: "Only First Name missing",
			query: url.Values{
				"Last name": []string{"Builder"},
			},
			expectedStatus: http.StatusOK,
			expectedBody:   "Vanakam World",
		},
		{
			name: "Only Last Name missing",
			query: url.Values{
				"First name": []string{"Bob"},
			},
			expectedStatus: http.StatusOK,
			expectedBody:   "Vanakam World",
		},
		{
			name: "Both names present",
			query: url.Values{
				"First name": []string{"Bob"},
				"Last name":  []string{"Builder"},
			},
			expectedStatus: http.StatusOK,
			expectedBody:   "Vanakam Builder, Bob",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reqUrl := "/hello"
			if len(tt.query) > 0 {
				reqUrl += "?" + tt.query.Encode()
			}
			req, err := http.NewRequest("GET", reqUrl, nil)
			if err != nil {
				t.Fatal(err)
			}

			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(sayHello)

			handler.ServeHTTP(rr, req)

			if status := rr.Code; status != tt.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, tt.expectedStatus)
			}

			var response ResponseData
			err = json.Unmarshal(rr.Body.Bytes(), &response)
			if err != nil {
				t.Fatalf("could not unmarshal response: %v", err)
			}

			if response.Message != tt.expectedBody {
				t.Errorf("handler returned unexpected body: got %q want %q",
					response.Message, tt.expectedBody)
			}
		})
	}
}
