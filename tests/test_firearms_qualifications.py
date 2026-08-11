import json
import pytest

from backend.app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_get_firearms_qualifications(client):
    response = client.get("/firearms_qualifications")
    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)

    # If the database has records, validate expected keys
    if data:
        item = data[0]
        expected_keys = {
            "qualification_id",
            "student_id",
            "qualification_name",
            "qualification_level",
            "issue_date",
            "instructor",
        }
        assert expected_keys.issubset(set(item.keys()))
