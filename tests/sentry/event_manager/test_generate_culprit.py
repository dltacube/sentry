from __future__ import annotations

from typing import Any

from sentry.constants import MAX_CULPRIT_LENGTH
from sentry.culprit import generate_culprit
from sentry.grouping.utils import hash_from_values


def test_with_exception_interface():
    data = {
        "exception": {
            "values": [
                {
                    "stacktrace": {
                        "frames": [
                            {"lineno": 1, "filename": "foo.py"},
                            {"lineno": 1, "filename": "bar.py", "in_app": True},
                        ]
                    }
                }
            ]
        },
        "stacktrace": {
            "frames": [
                {"lineno": 1, "filename": "NOTME.py"},
                {"lineno": 1, "filename": "PLZNOTME.py", "in_app": True},
            ]
        },
        "request": {"url": "http://example.com"},
    }
    assert generate_culprit(data) == "bar.py in ?"


def test_with_missing_exception_stacktrace():
    data = {
        "exception": {
            "values": [
                {"stacktrace": None},
                {"stacktrace": {"frames": None}},
                {"stacktrace": {"frames": [None]}},
            ]
        },
        "request": {"url": "http://example.com"},
    }
    assert generate_culprit(data) == "http://example.com"


def test_with_stacktrace_interface():
    data = {
        "stacktrace": {
            "frames": [
                {"lineno": 1, "filename": "NOTME.py"},
                {"lineno": 1, "filename": "PLZNOTME.py", "in_app": True},
            ]
        },
        "request": {"url": "http://example.com"},
    }
    assert generate_culprit(data) == "PLZNOTME.py in ?"


def test_with_missing_stacktrace_frames():
    data = {"stacktrace": {"frames": None}, "request": {"url": "http://example.com"}}
    assert generate_culprit(data) == "http://example.com"


def test_with_empty_stacktrace():
    data = {"stacktrace": None, "request": {"url": "http://example.com"}}
    assert generate_culprit(data) == "http://example.com"


def test_with_only_http_interface():
    data: dict[str, Any] = {"request": {"url": "http://example.com"}}
    assert generate_culprit(data) == "http://example.com"

    data = {"request": {"url": None}}
    assert generate_culprit(data) == ""

    data = {"request": {}}
    assert generate_culprit(data) == ""

    data = {"request": None}
    assert generate_culprit(data) == ""


def test_empty_data():
    assert generate_culprit({}) == ""


def test_truncation():
    data: dict[str, dict[str, Any]] = {
        "exception": {
            "values": [{"stacktrace": {"frames": [{"filename": "x" * (MAX_CULPRIT_LENGTH + 1)}]}}]
        }
    }
    assert len(generate_culprit(data)) == MAX_CULPRIT_LENGTH

    data = {"stacktrace": {"frames": [{"filename": "x" * (MAX_CULPRIT_LENGTH + 1)}]}}
    assert len(generate_culprit(data)) == MAX_CULPRIT_LENGTH

    data = {"request": {"url": "x" * (MAX_CULPRIT_LENGTH + 1)}}
    assert len(generate_culprit(data)) == MAX_CULPRIT_LENGTH


def test_hash_from_values():
    result = hash_from_values(["foo", "bar", "foô"])
    assert result == "6d81588029ed4190110b2779ba952a00"


def test_nel_culprit():
    data = {"nel": {"body": {"phase": "application", "type": "http.error", "status_code": 418}}}
    assert (
        generate_culprit(data)
        == "The user agent successfully received a response, but it had a 418 status code"
    )

    data = {"nel": {"body": {"phase": "connection", "type": "tcp.reset"}}}
    assert generate_culprit(data) == "The TCP connection was reset"

    data = {"nel": {"body": {"phase": "dns", "type": "dns.weird"}}}
    assert generate_culprit(data) == "dns.weird"

    data = {"nel": {"body": {"phase": "dns"}}}
    assert generate_culprit(data) == "<missing>"
