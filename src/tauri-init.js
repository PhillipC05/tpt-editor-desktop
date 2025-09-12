// Tauri initialization script
console.log('Tauri initialization script loaded');

// This file can be used for any JavaScript-based initialization
// that needs to happen when the Tauri app starts

// Import any Tauri APIs needed
import { appWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';

// Example of how to use Tauri APIs
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Tauri app DOM ready');
    
    // You can add any initialization code here that needs to run
    // when the Tauri app starts
    
    // Example: Get app version
    try {
        // This would call a Tauri command
        // const version = await invoke('get_app_version');
        // console.log('App version:', version);
    } catch (error) {
        console.error('Error getting app version:', error);
    }
});