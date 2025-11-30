import React from "react";

export default function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-logo">
                    <span className="logo-emoji">💰</span>
                    <h1 className="logo-text">SplitClone</h1>
                </div>

                <div className="loading-spinner">
                    <div className="spinner-box"></div>
                    <div className="spinner-box"></div>
                    <div className="spinner-box"></div>
                </div>

                <p className="loading-text">Loading your expenses...</p>
            </div>
        </div>
    );
}
