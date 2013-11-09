<?php   
    /* 
    Plugin Name: Medium Editor Plugin
    Plugin URI: https://github.com/gersande/medium-editor-plugin
    Description: Based on Davi Ferreira's pure https://github.com/daviferreira/medium-editor JavaScript Medium Editor 
    Author: Gersande 
    Version: 1.0 
    Author URI: http://gersande.com 
      
**** THE FOLLOWING DID NOT WORK BECAUSE ADD_ACTION('WP_HEAD'...ETC) ADDS IT TO THE CURRENT THEMES' HEAD!

function addToHead() {
	include('mediumContent.php');
}

add_action('wp_head','addToHead');
*/

function load_custom_wp_admin_style() {
        wp_register_style( 'medium_editor_css', plugin_dir_url( __FILE__ ) . 'css/medium-editor.css', false, '1.0.0' );
        wp_enqueue_style( 'medium_editor_css' );
}
add_action( 'admin_enqueue_scripts', 'load_custom_wp_admin_style' );

function load_custom_wp_admin_scripts() {
        wp_register_style( 'medium_editor_js', plugin_dir_url( __FILE__ ) . 'js/medium-editor.js', false, '1.0.0' );
        wp_enqueue_style( 'medium_editor_js' );
}
add_action( 'admin_enqueue_scripts', 'load_custom_wp_admin_scripts' );
?>