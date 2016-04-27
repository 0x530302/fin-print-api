# fin-print-api
provides a rest api for the fin exam printing service

baseUrl: http://print-api.example.com:8080/v1/

---

## Course
A collection of all available courses

### /course

* **get**: Get a list of all available courses and the corresponding document count

### /course/{id}

* **get**: Get a single course and all corresponding documents

## Order
A collection of orders

### /order

* **post**: Order a print

