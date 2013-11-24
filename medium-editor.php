<?php   
    /* 
    Plugin Name: Medium Editor Plugin
    Plugin URI: https://github.com/gersande/medium-editor-plugin
    Description: Based on Davi Ferreira's pure https://github.com/daviferreira/medium-editor JavaScript Medium Editor 
    Author: Gersande 
    Version: 1.0 
    Author URI: http://gersande.com 
*/

if(!class_exists('MediumEditor')) {
  
  ob_start();
  
  $wp_34 = false;
  if(version_compare(get_bloginfo('version'), '3.4', '>=')) {
    $wp_34 = true;
  }
  define('WP_34', $wp_34);
  
  // Define the default path and URL for the WP Editor plugin
  $plugin_file = __FILE__;
  if(isset($plugin)) {
    $plugin_file = $plugin;
  }
  elseif(isset($mu_plugin)) {
    $plugin_file = $mu_plugin;
  }
  elseif(isset($network_plugin)) {
    $plugin_file = $network_plugin;
  }
  define('MediumEditor_PATH', WP_PLUGIN_DIR . '/' . basename(dirname($plugin_file)) . '/');
  define('MediumEditor_URL', plugin_dir_url(MediumEditor_PATH) . basename(dirname($plugin_file)) . '/');
  
  // Define the WP Editor version number
  define('MediumEditor_VERSION_NUMBER', MediumEditorVersionNumber());
  
  // IS_ADMIN is true when the dashboard or the administration panels are displayed
  if(!defined('IS_ADMIN')) {
    define('IS_ADMIN',  is_admin());
  }
  
  $windows = false;
  if(strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    $windows = true;
  }
  
  define('WPWINDOWS', $windows);
  
  load_plugin_textdomain('MediumEditor', false, '/' . basename(dirname(__FILE__)) . '/languages/');
  
  // Load the main WP Editor class
  require_once(MediumEditor_PATH . 'classes/MediumEditor.php');
  $wpedit = new MediumEditor();

  // Register activation hook to install WP Editor database tables and system code
  register_activation_hook(__FILE__, array($wpedit, 'install'));

  // Check for WordPress 3.1 auto-upgrades
  if(function_exists('register_update_hook')) {
    register_update_hook(__FILE__, array($wpedit, 'install'));
  }

  // Initialize the main WP Editor Class
  add_action('init',  array($wpedit, 'init'));
  
  // Add settings link to plugin page
  add_filter('plugin_action_links', 'MediumEditorSettingsLink',10,2);
}

function MediumEditorSettingsLink($links, $file) {
  $thisFile = plugin_basename(MediumEditor_PATH) . '/' . basename(__FILE__);
  if($file == $thisFile) {
    $settings = '<a href="' . admin_url('admin.php?page=MediumEditor_admin') . '" title="' . __('Open the settings page for this plugin', 'MediumEditor') . '">' . __('Settings', 'MediumEditor') . '</a>';
    array_unshift($links, $settings);
  }
  return $links;
}
function MediumEditorVersionNumber() {
  if(!function_exists('get_plugin_data')) {
    require_once(ABSPATH . 'wp-admin/includes/plugin.php');
  }
  $plugin_data = get_plugin_data(MediumEditor_PATH . '/MediumEditor.php');
  return $plugin_data['Version'];
}