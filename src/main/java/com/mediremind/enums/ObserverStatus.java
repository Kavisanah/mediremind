package com.mediremind.enums;

public enum ObserverStatus {
    PENDING,   // invite sent, not yet accepted
    ACTIVE,    // accepted, receiving notifications
    REVOKED    // patient removed the observer
}
