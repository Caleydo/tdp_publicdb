def test_me():
    assert 1 == 1


# def test_health(client):
#     response = client.get("/health", headers={"Authorization": "admin:admin"})
#     assert response.status_code == 200
#     assert response.json() == "ok"


# def test_genehopper_proxy(client):
#     response = client.get("/api/tdp/proxy/genehopper_similar?gene=EGFR", headers={"Authorization": "admin:admin"})
#     assert response.status_code == 200
