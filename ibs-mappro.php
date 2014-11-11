<?php
/*
  Plugin Name: IBS Mappro
  Plugin URI: http://wordpress.org/extend/plugins/
  Description: implements Google Maps API V3 for Wordpress Adimin and shortcode.
  Author: Harry Moore
  Version: 0.1
  Author URI: http://indianbendsolutions.com
  License: GPLv2 or later
  License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

/*
  This program is distributed in the hope that it will be useful, but
  WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */
define('IBS_MAPPRO_VERSION', '0.1');

register_activation_hook(__FILE__, 'ibs_mappro_activate');

function ibs_mappro_activate() {
    ibs_mappro_set_options();
    if (false === get_option('ibs_mappro_icons')) {
        ibs_mappro_set_icons();
    }
    if (false === get_option('ibs_mappro_garmin')) {
        ibs_mappro_set_garmin();
    }
}

function ibs_mappro_set_options() {
    $options = get_option('ibs_mappro_options');
    $arr = array(
        "debug" => "no",
        "ui_theme" => "cupertino",
        "header" => "IBS Mappro",
        "debug" => "yes",
        "defaultAddress" => "",
        "ui_theme" => "cupertino"
    );
    foreach ($arr as $key => $value) {
        if (!isset($options[$key])) {
            $options[$key] = $value;
        }
    }
    update_option('ibs_mappro_options', $options);
}

function ibs_mappro_set_icons() {
    $options = array();
    $icons = IBS_MAPPRO::get_files(str_replace('\\', '/', plugin_dir_path(__FILE__)) . 'icons/kml_shapes');
    $count = 0;
    foreach ($icons as $icon) {
        $path_parts = pathinfo($icon);
        $basename = $path_parts['basename'];
        $filename = $path_parts['filename'];
        $options[$count++] = array('name' => $filename, 'url' => plugins_url("icons/kml_shapes/$basename", __FILE__));
    }
    update_option('ibs_mappro_icons', $options);
}

function ibs_mappro_set_garmin() {
    //garmin symbols
    require_once('lib/garmin_symbols.php');
    $icons = IBS_MAPPRO::get_files(str_replace('\\', '/', plugin_dir_path(__FILE__)) . 'icons/garmin');
    for ($i = 0; $i < count($garmin_symbols); $i++) {
        $url = plugins_url('icons/kml_shapes/question.png', __FILE__);
        foreach ($icons as $icon) {
            $path_parts = pathinfo($icon);
            $basename = $path_parts['basename'];
            $filename = strtolower($path_parts['filename']);
            $filename = str_replace('-', ' ', $filename);
            if (strtolower($garmin_symbols[$i]) === $filename) {
                $url = plugins_url("icons/garmin/$basename", __FILE__);
                break;
            }
        }
        $options[$i] = array('name' => $garmin_symbols[$i], 'url' => $url);
    }
    update_option('ibs_mappro_garmin', $options);
}

register_deactivation_hook(__FILE__, 'ibs_mappro_deactivate');

function ibs_mappro_deactivate() {
    
}

register_uninstall_hook(__FILE__, 'ibs_mappro_uninstall');

function ibs_mappro_uninstall() {
    delete_option('ibs_mappro_options');
    delete_option('ibs_mappro_icons');
    delete_option('ibs_mappro_garmin');
}

class IBS_MAPPRO {

    static $add_script = 0;
    static $debug = false;
    static $ui_theme = "cupertino";
    static $map_url = null;
    static $map_ajax = null;
    static $map_root = null;
    static $options = null;

    static function get_root() {
        //copied from wp-admin/includes/file.php
        $home = set_url_scheme(get_option('home'), 'http');
        $siteurl = set_url_scheme(get_option('siteurl'), 'http');
        if (!empty($home) && 0 !== strcasecmp($home, $siteurl)) {
            $wp_path_rel_to_home = str_ireplace($home, '', $siteurl); /* $siteurl - $home */
            $pos = strripos(str_replace('\\', '/', $_SERVER['SCRIPT_FILENAME']), trailingslashit($wp_path_rel_to_home));
            $home_path = substr($_SERVER['SCRIPT_FILENAME'], 0, $pos);
            $home_path = trailingslashit($home_path);
        } else {
            $home_path = ABSPATH;
        }
        return str_replace('\\', '/', $home_path);
    }

    static function init() {
        $test = get_option('ibs_mappro_icons');
        self::$map_url = plugins_url('ibs-mappro/');
        self::$map_ajax = admin_url("admin-ajax.php");
        self::$map_root = str_replace('\\', '/', plugin_dir_path(__FILE__));
        self::$options = get_option('ibs_mappro_options');
        self::$debug = self::$options['debug'] == 'yes';
        self::$ui_theme = self::$options['ui_theme'];
        add_action('admin_init', array(__CLASS__, 'options_init'));
        add_action('admin_menu', array(__CLASS__, 'add_admin_page'));
        add_action('admin_enqueue_scripts', array(__CLASS__, 'enqueue_admin_scripts'));
        add_shortcode('ibs-mappro', array(__CLASS__, 'handle_shortcode'));
        add_action('init', array(__CLASS__, 'register_script'));
        add_action('wp_head', array(__CLASS__, 'print_script_header'));
        add_action('wp_footer', array(__CLASS__, 'print_script_footer'));
        add_action('admin_print_scripts', array(__CLASS__, 'print_admin_scripts'));

//ajax hooks

        add_action('wp_ajax_ibs_mappro_location', array(__CLASS__, 'location'));
        add_action('wp_ajax_nopriv_ibs_mappro_location', array(__CLASS__, 'location'));

        add_action('wp_ajax_ibs_mappro_CORS', array(__CLASS__, 'CORS'));
        add_action('wp_ajax_nopriv_ibs_mappro_CORS', array(__CLASS__, 'CORS'));

        add_action('wp_ajax_ibs_mappro_folders', array(__CLASS__, 'folders'));
        add_action('wp_ajax_nopriv_ibs_mappro_folders', array(__CLASS__, 'folders'));

        add_action('wp_ajax_ibs_mappro_savexml', array(__CLASS__, 'savexml'));
        add_action('wp_ajax_nopriv_ibs_mappro_savexml', array(__CLASS__, 'savexml'));

        add_action('wp_ajax_ibs_mappro_remove', array(__CLASS__, 'remove'));
        add_action('wp_ajax_nopriv_ibs_mappro_remove', array(__CLASS__, 'remove'));

        add_action('wp_ajax_ibs_mappro_download', array(__CLASS__, 'download'));
        add_action('wp_ajax_nopriv_ibs_mappro_download', array(__CLASS__, 'download'));

        add_action('wp_ajax_ibs_mappro_pid', array(__CLASS__, 'pid'));
        add_action('wp_ajax_nopriv_ibs_mappro_pid', array(__CLASS__, 'pid'));

        add_action('wp_ajax_ibs_mappro_icons', array(__CLASS__, 'icons'));
        add_action('wp_ajax_nopriv_ibs_mappro_icons', array(__CLASS__, 'icons'));


        add_action('wp_ajax_ibs_mappro_icon_palette', array(__CLASS__, 'icon_palette'));
        add_action('wp_ajax_nopriv_ibs_mappro_icon_palette', array(__CLASS__, 'icon_palette'));

        add_action('wp_ajax_ibs_mappro_garmin', array(__CLASS__, 'garmin'));
        add_action('wp_ajax_nopriv_ibs_mappro_garmin', array(__CLASS__, 'garmin'));
    }

    static function defaults_icons() {
        
    }

    static function register_script() {
        $min = self::$debug ? '' : '.min';
        $minmax = self::$debug ? '.max' : '.min';
        $theme = self::$ui_theme;
        wp_register_style('ibs-map-ui-theme-style', plugins_url("css/jquery-ui-themes-1.11.1/themes/$theme/jquery-ui.min.css", __FILE__));
        wp_register_style("ibs-fineloader-style", plugins_url("js/jquery.fineuploader/css/fineuploader.css", __FILE__));
        wp_register_style("ibs-mappro-map-style", plugins_url("css/map.css", __FILE__));
        wp_register_style("ibs-dropdown-style", plugins_url("js/jquery.dropdown/jquery.dropdown.css", __FILE__));
        wp_register_style("ibs-filetree-style", plugins_url("js/jquery.filetree/jquery.filetree.css", __FILE__));
        wp_register_style("ibs-ckeditor-style", plugins_url("js/ckeditor_4.4.5_full/ckeditor/contents.css", __FILE__));
        wp_register_script("ibs-ckeditor-script", plugins_url("js/ckeditor_4.4.5_full/ckeditor/ckeditor.js", __FILE__), self::$core_handles);
        wp_register_script("ibs-ckeditor-adaptor-script", plugins_url("js/ckeditor_4.4.5_full/ckeditor/adapters/jquery.js", __FILE__));
        wp_register_script("ibs-filedownload-script", plugins_url("js/jquery.filedownload/jquery.filedownload.js", __FILE__));
        wp_register_script("ibs-filetree-script", plugins_url("js/jquery.filetree/jquery.filetree.js", __FILE__));
        wp_register_script("ibs-mappro-colorpicker-script", plugins_url("js/jquery.colorpicker/jquery.colorpicker.js", __FILE__));
        wp_register_script("ibs-fineloader-script", plugins_url("js/jquery.fineuploader/js/jquery.fineuploader.min.js", __FILE__));
        wp_register_script("ibs-dropdown-script", plugins_url("js/jquery.dropdown/jquery.dropdown.min.js", __FILE__));
        wp_register_script("ibs-scrollto-script", plugins_url("js/balupton-jquery-scrollto-a30313e/lib/jquery-scrollto.js", __FILE__));
        wp_register_script("ibs-mappro-markermanager-script", plugins_url("js/markermanager$min.js", __FILE__));
        wp_register_script("ibs-mappro-xmlwrite-script", plugins_url("js/xmlwriter$min.js", __FILE__));
        wp_register_script("ibs-mappro-purl-script", plugins_url("js/purl$min.js", __FILE__));
        wp_register_script("ibs-mappro-gpx-script", plugins_url("js/gpx$min.js", __FILE__));
        wp_register_script("ibs-mappro-kml-script", plugins_url("js/kml$min.js", __FILE__));
        wp_register_script("ibs-mappro-global-script", plugins_url("js/global$min.js", __FILE__));
        wp_register_script("ibs-mappro-map-script", plugins_url("js/map$min.js", __FILE__));
        wp_register_script("ibs-mappro-icons-script", plugins_url("js/icons$min.js", __FILE__));
        wp_register_script("ibs-mappro-file-script", plugins_url("js/file$min.js", __FILE__));
        wp_register_script("ibs-mappro-placemark-script", plugins_url("js/placemark$min.js", __FILE__));
        wp_register_script("ibs-mappro-segment-script", plugins_url("js/segment$min.js", __FILE__));
        wp_register_script("ibs-mappro-elevation-script", plugins_url("js/elevation$min.js", __FILE__));
        wp_register_script("ibs-mappro-handlers-script", plugins_url("js/handlers$min.js", __FILE__));
        wp_register_script("ibs-mappro-dialogs-script", plugins_url("js/dialogs$min.js", __FILE__));
        wp_register_script("ibs-mappro-html-script", plugins_url("js/html$min.js", __FILE__));
        wp_register_script("ibs-mappro-admin-script", plugins_url("js/admin$min.js", __FILE__));
        wp_register_style("ibs-mappro-admin-style", plugins_url("css/admin.css", __FILE__));


        wp_register_style('ibs-qtip-style', plugins_url("js/jquery.qtip.2.1.1/jquery.qtip.css", __FILE__));
        wp_register_script('ibs-qtip-script', plugins_url("js/jquery.qtip.2.1.1/jquery.qtip.min.js", __FILE__));

        wp_localize_script('ibs-mappro-admin-script', 'ibs_mappro', array('ajax' => self::$map_ajax, 'site' => self::$map_url, 'root' => self::$map_root));
    }

    static $core_handles = array(
        'jquery',
        'json2',
        'jquery-color',
        'jquery-ui-core',
        'jquery-ui-widget',
        'jquery-ui-tabs',
        'jquery-ui-sortable',
        'jquery-ui-draggable',
        'jquery-ui-droppable',
        'jquery-ui-selectable',
        'jquery-ui-position',
        'jquery-ui-datepicker',
        'jquery-ui-resizable',
        'jquery-ui-dialog',
        'jquery-ui-button',
        'jquery-ui-spinner'
    );
    static $script_handles = array(
        'ibs-ckeditor-script',
        'ibs-ckeditor-adaptor-script',
        'ibs-filedownload-script',
        'ibs-filetree-script',
        'ibs-mappro-colorpicker-script',
        'ibs-fineloader-script',
        'ibs-dropdown-script',
        'ibs-scrollto-script',
        'ibs-mappro-markermanager-script',
        'ibs-mappro-xmlwrite-script',
        'ibs-mappro-purl-script',
        'ibs-mappro-gpx-script',
        'ibs-mappro-kml-script',
        'ibs-mappro-global-script',
        'ibs-mappro-map-script',
        'ibs-mappro-icons-script',
        'ibs-mappro-file-script',
        'ibs-mappro-placemark-script',
        'ibs-mappro-segment-script',
        'ibs-mappro-elevation-script',
        'ibs-mappro-handlers-script',
        'ibs-mappro-dialogs-script',
        'ibs-mappro-html-script'
    );
    static $style_handles = array(
        'ibs-map-ui-theme-style',
        'ibs-fineloader-style',
        'ibs-mappro-map-style',
        'ibs-dropdown-style',
        'ibs-filetree-style',
        'ibs-ckeditor-style'
    );

    static function enqueue_admin_scripts($page) {
        if ($page === 'settings_page_ibs_mappro') {
            wp_enqueue_style(self::$style_handles);
            wp_enqueue_script(self::$script_handles);

            wp_enqueue_style('ibs-qtip-style');
            wp_enqueue_script('ibs-qtip-script');

            wp_enqueue_style('ibs-mappro-admin-style');
            wp_enqueue_script('ibs-mappro-admin-script');
        }
    }

    static function print_admin_scripts() {
        ?>
        <script src="https://www.google.com/jsapi" type="text/javascript"></script>
        <script src='https://maps.google.com/maps/api/js?sensor=false&libraries=geometry' type="text/javascript"></script>
        <script type="text/javascript">google.load("visualization", "1", {packages: ["corechart"]});</script>
        <?PHP
    }

    static function print_script_header() {
        
    }

    static function print_script_footer() {
        if (self::$add_script > 0) {
            self::print_admin_scripts();
            wp_print_styles(self::$style_handles);
            wp_print_scripts(self::$script_handles);
        }
    }

    static function options_init() {
        register_setting('ibs_mappro_options', 'ibs_mappro_options');

        add_settings_section('ibs-mappro-general', '', array(__CLASS__, 'admin_general_header'), 'mappro-general');
        add_settings_field('debug', 'debug', array(__CLASS__, 'field_debug'), 'mappro-general', 'ibs-mappro-general');
        add_settings_field('ui_theme', 'ui theme', array(__CLASS__, 'field_ui_theme'), 'mappro-general', 'ibs-mappro-general');

        add_settings_section('ibs_mappro_main', '', array(__CLASS__, 'admin_options_header'), 'mappro-main');
        add_settings_field('defaultAddress', ' default address', array(__CLASS__, 'field_defaultAddress'), 'mappro-main', 'ibs_mappro_main');

        add_settings_section('ibs_mappro_maps', '', array(__CLASS__, 'admin_maps_header'), 'maps');
        add_settings_field('manage_maps', ' ', array(__CLASS__, 'field_manage_maps'), 'maps', 'ibs_mappro_maps');

        register_setting('ibs_mappro_icons', 'ibs_mappro_icons');
        add_settings_section('ibs_mappro_icons', '', array(__CLASS__, 'admin_icon_header'), 'icons');
        add_settings_field('icons', ' icons', array(__CLASS__, 'field_icons'), 'icons', 'ibs_mappro_icons');

        add_settings_section('ibs_manage_icons', '', array(__CLASS__, 'admin_manage_icon_header'), 'manage_icons');
        add_settings_field('manage_icons', ' ', array(__CLASS__, 'field_manage_icons'), 'manage_icons', 'ibs_manage_icons');


        register_setting('ibs_mappro_garmin', 'ibs_mappro_garmin');
        add_settings_section('ibs_mappro_garmin', '', array(__CLASS__, 'admin_garmin_header'), 'garmin');
        add_settings_field('icons', ' icons', array(__CLASS__, 'field_garmin'), 'garmin', 'ibs_mappro_garmin');
    }

    static function admin_general_header() {
        echo '<div class="ibs-admin-bar" >General settings</div>';
    }

    static function admin_options_header() {
        echo '<div class="ibs-admin-bar" > Options</div>';
    }

    static function admin_maps_header() {
        echo '<div class="ibs-admin-bar" >Map folders</div>';
    }

    static function admin_icon_header() {
        echo '<div class="ibs-admin-bar" >Icons</div>';
    }

    static function admin_manage_icon_header() {
        echo '<div class="ibs-admin-bar" >Icon folders</div>';
    }

    static function admin_garmin_header() {
        echo '<div class="ibs-admin-bar" >Garmin Symbols</div>';
    }

    static function field_debug() {
        $checked = self::$debug ? "checked" : '';
        echo '<p>determines whether to use minimized javascript</p>';
        echo '<input type="radio" name="ibs_mappro_options[debug]" value="yes" ' . $checked . '/>&nbspYes&nbsp&nbsp';
        $checked = self::$debug ? '' : "checked";
        echo '<input type="radio" name="ibs_mappro_options[debug]" value="no" ' . $checked . '/>&nbspNo';
    }

    static function field_ui_theme() {
        $result = array();
        $dir = get_home_path() . 'wp-content/plugins/ibs-mappro/css/jquery-ui-themes-1.11.1/themes/';
        if (file_exists($dir)) {
            $files = scandir($dir);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                foreach ($files as $file) {
                    if (file_exists($dir . $file) && $file != '.' && $file != '..' && is_dir($dir . $file)) {
                        $result[] = $file;
                    }
                }
            }
        }
        foreach ($result as &$line) {
            $line = "<option selected value='$line' >$line</option>";
        }
        echo "<select name='ibs_mappro_options[ui_theme]'>";
        foreach ($result as $option) {
            if (strpos($option, self::$options['ui_theme']) == false) {
                $option = str_replace('selected', '', $option);
            }
            echo $option;
        }
        echo "</select>";
    }

    static function field_defaultAddress() {
        $value = self::$options['defaultAddress'];
        echo "<input id='setting-defaultAddress' name='ibs_mappro_options[defaultAddress]' type='text' placeholder='default address; eg: city,state' size='100' value='$value' />";
    }

    static function field_manage_maps() {
        echo '<div class="tools-div" ><a id = "ibs-map-manage" href = "#" >Manage Folders</a></div>';
        echo '<div style="display:none"><div id = "ibs-map-clean"></div></div>';
    }

    static function field_icons() {
        $options = get_option('ibs_mappro_icons');
        echo '<div class="icon-div" >';
        echo '<p> Icon Palette </p>';
        echo '<div class="icon-add" title="add icon" ><input id="icon-add-input" type="text" placeholder="drop icon here to add." disabled value =""/></div>';
        echo '<div class="icon-palette">';
        echo '<ul id="current-icon-list">';
        foreach ($options as $key => $value) {
            $name = $value['name'];
            $url = $value['url'];
            echo "<li class='current-icon-item' style='background: url($url) left top no-repeat; vertical-align:middle;'/>"
            . "<div><input class='current-icon-name' type='text' value='$name' name='ibs_mappro_icons[$key][name]' />"
            . "<a class='icon-delete' title='delete' ></a></div>"
            . "<input class='current-icon-url' type='hidden' value='$url' name='ibs_mappro_icons[$key][url]' /></li>";
        }
        echo '</ul></div></div>';
        $libs = self::get_dirs(str_replace('\\', '/', plugin_dir_path(__FILE__)) . 'icons');
        echo '<div style=" height:100%; width:auto%; margin-left:320px;">';
        echo '<p> Available Icon Libraries </p>';
        echo '<select id="icon-library-select">';
        foreach ($libs as $lib) {
            echo "<option class='icon-lib' value='$lib' >$lib</option>";
        }
        echo '</select>';
        echo '<div id="icon-library-list" style="margin-left:10px; margin-top:25px; list-style-type:none;">';
        echo '</div>';
        echo '</div>';
    }

    static function field_manage_icons() {
        echo '<div class="tools-div" ><a id = "ibs-upload-action" href = "#" >Upload Icons</a><a id = "ibs-clean-action" href = "#" >Manage Folders</a></div>';
        echo '<div style="display:none"><div id = "ibs-icon-clean"></div><div id = "ibs-icon-upload"></div></div>';
    }

    static function field_garmin() {
        $options = get_option('ibs_mappro_garmin');
        echo '<div class="icon-div" >';
        echo '<div class="icon-palette">';
        echo '<p> Garmin Symbols </p>';
        echo '<ul id="garmin-icon-list">';
        foreach ($options as $key => $value) {
            $name = $value['name'];
            $url = $value['url'];
            echo "<li class='garmin-icon-item' style='background: url($url) left top no-repeat; vertical-align:middle;'/>"
            . "<input class='garmin-icon-name' type='text' disabled value='$name'/>"
            . "<input class='garmin-icon-name' type='hidden' value='$name' name='ibs_mappro_garmin[$key][name]' />"
            . "<input class='garmin-icon-url' type='hidden' value='$url' name='ibs_mappro_garmin[$key][url]' /></li>";
        }
        echo '</ul></div></div>';
        $libs = self::get_dirs(str_replace('\\', '/', plugin_dir_path(__FILE__)) . 'icons');
        echo '<div class="lib-select">';
        echo '<p> Available Icon Libraries </p>';
        echo '<select id="garmin-library-select">';
        foreach ($libs as $lib) {
            echo "<option class='icon-lib' value='$lib' >$lib</option>";
        }
        echo '</select>';

        echo '<div id="garmin-library-list">';
        echo '</div>';
        echo '</div>';
    }

    static function add_admin_page() {
        add_options_page('IBS Mappro', 'IBS Mappro', 'manage_options', 'ibs_mappro', array(__CLASS__, 'options_page'));
    }

    static function options_page() {
        ?>
        <script type="text/javascript">
            var Mappro = null;
            jQuery(document).ready(function ($) {
                $("#ibs-map-tabs").tabs({beforeActivate: function (event, ui) {
                        var tab = $(ui.newTab).find('a').text();
                        switch (tab) {
                            case 'Map':
                                if (Mappro === null) {
                                    Mappro = new Map({
                                        'div': '#ibs-admin-div',
                                        'width': ($('#ibs-map-tabs').width() - 40) + 'px',
                                        'height': '800',
                                        'ajax': '<?PHP echo self::$map_ajax; ?>',
                                        'site': '<?PHP echo self::$map_url; ?>',
                                        'root': '<?PHP echo self::$map_root; ?>',
                                        'address': '<?PHP echo self::$options['defaultAddress']; ?>',
                                        'user_type': 'admin',
                                        'edit': true
                                    });
                                } else {
                                    Mappro.reset();
                                }
                                break;
                            default:
                        }
                    }});
                $("#ibs-map-tabs").show();
            });
        </script>
        <div id="ibs-map-tabs" style="display:none">
            <ul id="ibs-map-tabs-nav">
                <li><a href="#ibs-map-tab-settings">Settings</a></li>
                <li><a href="#ibs-map-tab-icons">Icons</a></li>
                <li><a href="#ibs-map-tab-garmin">Garmin</a></li>
                <li><a href="#ibs-map-tab-about">Shortcode</a></li>
                <li><a href="#ibs-map-tab-map">Map</a></li>
            </ul>

            <div style="clear:both"></div>

            <div id="ibs-map-tab-settings">
                <form action="options.php" method="post">
                    <?php settings_fields('ibs_mappro_options'); ?>
                    <?php do_settings_sections('mappro-general'); ?>
                    <?php do_settings_sections('mappro-main'); ?>
                    <?php do_settings_sections('maps'); ?>
                    <?php submit_button(); ?>
                </form>
            </div>
            <div id="ibs-map-tab-map">
                <div id="ibs-admin-div"></div>
            </div>
            <div id="ibs-map-tab-about">
                <div class="ibs-admin-bar">&nbsp; [ibs-mappro options]</div>
                <div id="shortcode-options">
                    <div> <div>title</div><input class="shortcode-input" type="text" placeholder="map title" id="shortcode-title" value="" /></div>
                    <div> <div>mode</div><select class="shortcode-input" name="mode" id="shortcode-mode" >
                            <option value="viewer" selected >Viewer</option>
                            <option value="edit">Edit</option>
                        </select> warning: edit = create and modify maps.
                    </div>
                    <div> <div>user_name</div><input class="shortcode-input" name="user_name" type="text" placeholder="user name" value="" id="shortcode-username"/> default folder naming when in "edit" mode and user type is "admin".</div>
                    <div> <div>user_type</div><select class="shortcode-input" name="user_type" id="shortcode-type" >
                            <option value="guest" selected >Guest</option>
                            <option value="admin">Admin</option>
                        </select> warning: admin = access to server folders.
                    </div>

                    <div> <div>pid</div><input class="shortcode-input" type="text" placeholder="email tracking" name=pid" id="shortcode-pids"/> names of markers to track by email postings.</div>
                    <div> <div>width</div><input class="shortcode-input" type="text" placeholder="map width" name="width" value="550px" id="shortcode-width" /></div>
                    <div> <div>height</div><input class="shortcode-input" type="text" placeholder="map height" name="height" value="550px" id="shortcode-height" /></div>
                    <div> <input class="shortcode-input" type="text" placeholder="map url" name="url" disabled value="" id="shortcode-url" /></div>
                </div>
                <div class="ibs-admin-bar" >&nbsp; Select map file</div>
                <div id="shortcode-browser"></div>
                <div style="font-weight:bold;background-color:gray; color:white; padding:3px;" >&nbsp; Generated shortcode</div>
                <textarea id="shortcode"></textarea>
                <div class="ibs-admin-bar" >&nbsp;</div>
            </div>
            <div id="ibs-map-tab-icons">
                <form action="options.php" method="post">
                    <?php settings_fields('ibs_mappro_icons'); ?>
                    <?php do_settings_sections('icons'); ?>
                    <?php do_settings_sections('manage_icons'); ?>
                    <?php submit_button(); ?>
                </form>
            </div>
            <div id="ibs-map-tab-garmin">
                <form action="options.php" method="post">
                    <?php settings_fields('ibs_mappro_garmin'); ?>
                    <?php do_settings_sections('garmin'); ?>
                    <?php submit_button(); ?>
                </form>
            </div>
        </div>

        <?php
    }

    static function handle_shortcode($atts, $content = null) {
        self::$add_script += 1;
// [ibs-map width=800px, height=600px, id=1, title="my viewer", url="" edit=false user_type="admin" user_name="" pid=""]
        $div = 'ibs-map-viewer-' . self::$add_script;
        $mid = 'MAP-' . self::$add_script;
        $title = isset($atts['title']) && $atts['title'] !== '' ? $atts['title'] : 'IBS Map Viewer ' . self::$add_script;
        $url = isset($atts['url']) && $atts['url'] ? $atts['url'] : '';
        $width = isset($atts['width']) && $atts['width'] ? $atts['width'] : '550px';
        $height = isset($atts['height']) && $atts['height'] ? $atts['height'] : '550px';
        $mode = isset($atts['mode']) && $atts['mode'] == 'edit' ? 'edit' : 'viewer';
        $user_type = isset($atts['user_type']) && $atts['user_type'] == 'admin' ? 'admin' : 'guest';
        $user_name = isset($atts['user_name']) ? $atts['user_name'] : '';
        $pid = isset($atts['pid']) ? $atts['pid'] : '';


        ob_start();
        if ($title !== '') {
            echo '<div id="' . $div . '"><h1>' . $title . '</h1></div>';
        } else {
            echo '<div id="' . $div . '"></div>';
        }
        ?>
        <script type="text/javascript">
            jQuery(document).ready(function ($) {
                if (typeof mapsobj == 'undefined') {
                    var mappros = [];
                }
                mappros.push(new Map({
                    'mid': '<?PHP echo $mid; ?>',
                    'div': '#<?PHP echo $div; ?>',
                    'width': '<?PHP echo $width; ?>',
                    'height': '<?PHP echo $height; ?>',
                    'ajax': '<?PHP echo self::$map_ajax; ?>',
                    'site': '<?PHP echo self::$map_url; ?>',
                    'root': '<?PHP echo self::$map_root; ?>',
                    'url': '<?PHP echo $url; ?>',
                    'user_type': '<?PHP echo $user_type; ?>',
                    'user_name': '<?PHP echo $user_name; ?>',
                    'pid': '<?PHP echo $pid; ?>',
                    'mode': '<?PHP echo $mode; ?>'
                }));
            });
        </script> 
        <?PHP
        $output = ob_get_contents();
        ob_end_clean();
        return $output;
    }

    static function get_files($dir) {
        $result = array();
        if (file_exists($dir)) {
            $dir .= '/';
            $files = scandir($dir);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                foreach ($files as $file) {
                    if (file_exists($dir . $file) && $file != '.' && $file != '..' && !is_dir($dir . $file)) {
                        $result[] = htmlentities($file);
                    }
                }
            }
        }
        return $result;
    }

    static function get_dirs($dir) {
        $results = array();
        if (file_exists($dir)) {
            $dir .= '/';
            $files = scandir($dir);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                foreach ($files as $file) {
                    if (file_exists($dir . $file) && $file != '.' && $file != '..' && is_dir($dir . $file)) {
                        $results[] = htmlentities($file);
                    }
                }
            }
        }
        return $results;
    }

//ajax interface        

    static function upload() {
        require_once('upload.html.php');
    }

    static function savexml() {
        $data = $_REQUEST['data'];
        if ($data) {
            $data = urldecode($data);
            $filename = self::$map_root . 'maps/' . $_REQUEST['filename'];
            $path = pathinfo($filename);
            $ext = $path['extension'];

            $dir = $path['dirname'];
            if (!is_dir($dir)) {
                if (!mkdir($dir)) {
                    echo "Failed to save map. Could not create folder.";
                    return;
                }
            }
            if ($ext == 'kmz') {
                $zip = new ZipArchive();
                if (file_exists($filename)) {
                    $zip->open($filename, ZIPARCHIVE::OVERWRITE);
                } else {
                    $zip->open($filename, ZIPARCHIVE::CREATE);
                }
                $zip->addFromString($path['filename'] . '.maps', $data);
                $zip->close();
                echo basename($filename);
                return;
            } else {
                $message . + ' file action.';
                $r = unlink($filename);
                $handle = @fopen($filename, "w");
                $result = $handle;
                if ($result && 1 == 1) {
                    $result = fwrite($handle, $data);
                    fclose($handle);
                    if ($result) {
                        echo basename($filename);
                        return;
                    }
                }
            }
            echo 'Error writing file' . basename($filename);
            return;
        }
        echo 'Missing data';
        exit;
    }

    static function folders() {
        $type = $_REQUEST['type'];
        switch ($type) {
            case 'map' : $do_files = true;
                $allowed = array('kml', 'kmz', 'gpx');
                break;
            case 'dir' : $do_files = false;
                $allowed = array();
                break;
            case 'img' : $do_files = true;
                $allowed = array('png', 'jpeg', 'jpg', 'gif');
                break;
            case 'all' : $do_files = true;
                $allowed = array();
                break;
        }
        $_REQUEST['dir'] = urldecode($_REQUEST['dir']);
        if (file_exists($_REQUEST['dir'])) {
            $files = scandir($_REQUEST['dir']);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                echo "<ul class=\"jqueryFileTree\" style=\"display: none;\">";
// All dirs
                foreach ($files as $file) {
                    if (file_exists($_REQUEST['dir'] . $file) && $file != '.' && $file != '..' && is_dir($_REQUEST['dir'] . $file)) {
                        echo "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($_REQUEST['dir'] . $file) . "/\">" . htmlentities($file) . "</a></li>";
                    }
                }
// All files
                if ($do_files) {
                    foreach ($files as $file) {
                        if (file_exists($_REQUEST['dir'] . $file) && $file != '.' && $file != '..' && !is_dir($_REQUEST['dir'] . $file)) {
                            $ext = preg_replace('/^.*\./', '', $file);
                            $test = strtolower($ext);
                            if (count($allowed) == 0 || in_array($test, $allowed)) {
                                echo "<li class=\"file ext_$ext\"><a href=\"#\" rel=\"" . htmlentities($_REQUEST['dir'] . $file) . "\">" . htmlentities($file) . "</a></li>";
                            }
                        }
                    }
                }
                echo "</ul>";
            }
        }
        exit;
    }

    static function remove() {
        $type = $_REQUEST['type'];
        switch ($type) {
            case 'file' :
                $mapid = $_REQUEST['filename'];
                if (file_exists($mapid)) {
                    $r = @unlink($mapid);
                    $mapid = str_replace('//', '/', $mapid);
                    $item = str_replace(self::$map_root, '', $mapid) . PHP_EOL;
                    echo sprintf('File: %s removed.', $item);
                } else {
                    echo sprintf('File: %s not found.', $mapid);
                }
                break;
            case 'files' :
                $dir = $_REQUEST['dir'];
                $list = urldecode($_REQUEST['files']);
                $files = explode(';', $list);
                $result = '';
                foreach ($files as $file) { // iterate files
                    if (is_file($file)) {
                        $file = str_replace('//', '/', $file);
                        $item = str_replace(self::$map_root, '', $file) . PHP_EOL;
                        $result .= $item;
                        @unlink($file); // delete file
                    }
                }
                echo $result .= ' Files Removed';
                break;

            case 'directory':
                $dir = $_REQUEST['dir'];
                $it = new RecursiveDirectoryIterator($dir);
                $files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);
                foreach ($files as $file) {
                    if ($file->getFilename() === '.' || $file->getFilename() === '..') {
                        continue;
                    }
                    if ($file->isDir()) {
                        rmdir($file->getRealPath());
                    } else {
                        unlink($file->getRealPath());
                    }
                }
                rmdir($dir);
                break;
        }
    }

    static function CORS() {
        $url = $_POST['path'];
        $info_url = parse_url($url);
        $info_path = pathinfo($info_url['path']);
        $ext = strtolower($info_path['extension']);
        $ch = curl_init();
        $service = str_replace(' ', '%20', $url);
        curl_setopt($ch, CURLOPT_URL, $service);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $data = curl_exec($ch);
        $headers = curl_getinfo($ch);
        curl_close($ch);
        if ($headers['http_code'] != '200') {
            echo "An error has occurred accessing this service";
        } else {
            if ($ext == 'kmz') {
                $file = self::$map_root . 'maps/work/zip.zip';
                $r = @unlink($file);
                $handle = @fopen($file, "w");
                $result = $handle;
                if ($result) {
                    $result = fwrite($handle, $data);
                    fclose($handle);
                    if ($result) {
                        $archive = new PclZip($file);
                        $buf = $archive->extract(PCLZIP_OPT_EXTRACT_AS_STRING);
                        if ($buf == 0) {
                            echo 'failed to unzip kmz file.';
                        } else {
                            echo $buf[0]['content'];
                        }
                    } else {
                        echo 'failed to open kmz file.';
                    }
                } else {
                    echo 'failed to open kmz file.';
                }
            } else {
                echo $data;
            }
        }
        exit;
    }

    static function pid() {
        if ($_REQUEST['pid']) {
            $request = explode(',', $_REQUEST['pid']);
            $result = array();
            $pids = get_option('ibs-where-is', array("Harry" => "8373 E Pepper Tree Ln, Scottsdale, AZ 85250", "jim" => "kansas city, mo", "joe" => "linden, tx", "bob" => "little rock, ar"));
            foreach ($request as $pid) {
                $pid = trim($pid);
                if (isset($pids[$pid])) {
                    $result[$pid] = $pids[$pid];
                }
            }
            echo json_encode($result);
        }
        exit;
    }

    static function icons() {
        if ($_REQUEST['lib']) {
            $lib = $_REQUEST['lib'];
            $result = array();
            $icons = self::get_files(str_replace('\\', '/', plugin_dir_path(__FILE__)) . 'icons/' . $lib);
            foreach ($icons as $icon) {
                $path_parts = pathinfo($icon);
                $dirname = $path_parts['dirname'];
                $basename = $path_parts['basename'];
                $extension = $path_parts['extension'];
                $filename = $path_parts['filename'];
                $url = plugins_url("icons/$lib/$basename", __FILE__);
                $result[$filename] = $url;
            }
            echo json_encode($result);
        }
        exit;
    }

    static function icon_palette() {
        $options = get_option('ibs_mappro_icons');
        echo json_encode($options);
        exit;
    }

    static function garmin() {
        $options = get_option('ibs_mappro_garmin');
        echo json_encode($options);
        exit;
    }

}

IBS_MAPPRO::init();
require_once(IBS_MAPPRO::get_root() . 'wp-admin/includes/class-pclzip.php');









