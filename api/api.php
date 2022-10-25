<?php
    // $json = $_REQUEST['data'];
    $json =  file_get_contents('php://input');
    // $info = json_encode($json);
    // $info = $json;
    // $file = fopen('../data/pinned-items.json','w+') or die("File not found");
    // fwrite($file, $info);

    file_put_contents('../data/pinned-items.json', $json);
    // fclose($file);

    file_put_contents('../data/tmp/pinned-items_'.date("Y-m-d_h:i").'.json', $json);
    // fclose($file);

    // echo $file;
    echo '<pre>'; 
    print_r($json);
    // print_r($json);
    // var_dump($_POST);


    // $request_body = file_get_contents('php://input');
    // var_dump($request_body);
?>