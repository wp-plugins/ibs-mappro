<?php

function getRoot() {
    $self_path = $_SERVER['PHP_SELF'];
    $root = $_SERVER['DOCUMENT_ROOT'];
    if (substr($root, strlen($root) - 1) == '/')
        $root = substr($root, 0, strlen($root) - 1);
    while (strpos($self_path, 'index') > 0) {
        $self_path = preg_replace("-[/\\\\][^/\\\\]+[/\\\\]?$-", '', $self_path);
    }
    $root .= $self_path . '/';
    return $root;
}

if (isset($_GET)) {
    $root = getRoot();
    $root = str_replace("lib/download.php/", '', $root);
    $filename = $root . $_GET['file'];
    $info = pathinfo($filename);
    $name = $info['basename'];
    if (file_exists($filename)) {
        header('Set-Cookie: fileDownload=true; path=/');
        header('Cache-Control: max-age=60, must-revalidate');
        header('Content-Disposition: attachment; filename="' . $title . '-' . $timestamp . '.csv"');
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $name . '"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filename));
        ob_clean();
        flush();
        readfile($filename);
        exit;
    } else {
        die;
    }
} else {
    die;
}
?>