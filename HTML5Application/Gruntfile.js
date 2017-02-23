/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
          pkg: grunt.file.readJSON("package.json"),
            name: "<%= pkg.name %>.<%= pkg.version %>",
           
            
            copy: {
              nodeModulesJsToLib: {
                    files: [
                        {expand: true,
                            src: [
                                "node_modules/jquery/dist/jquery.js",
                                "node_modules/geotiff/dist/geotiff.js",
                                "node_modules/proj4/dist/proj4.js",
                               ],
                               
                            dest: "public_html/js/",
                            flatten: true,
                            filter: "isFile"
                        }]} ,
                        
                cesiumModule: {
                    files: [
                     {
                     cwd:  "node_modules/cesium/dist/",  // set working folder / root to copy
                    src: '**/*',           // copy all files and subfolders
                dest: '"public_html/ThirdParty',    // destination folder
                expand: true  
                     }]
                }        
                        
    }         
    
        
        
    });
       require('load-grunt-tasks')(grunt);
       grunt.registerTask("build", ["copy:nodeModulesJsToLib", "copy:cesiumModule" ]);
};
