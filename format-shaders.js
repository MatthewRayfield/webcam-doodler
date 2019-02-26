var fs = require('fs');

fs.readdir('./', function (error, files) {
    files.forEach(function (fileName) {
        var filePath = './' + fileName;

        if (fileName.split('.').pop() != 'fsh') {
            console.log('[ NO  ] ' + fileName);
            return;
        }

        console.log('[ YES ] ' + fileName);

        fs.readFile(filePath, 'utf8', function (error, data) {
            var lines,
                split = fileName.split('.'),
                newData = 'var ' + split[0] + ' = ';

            if (error) {
                console.log(error);
                return;
            }

            data = data.replace(/highp /g, '');

            lines = data.split('\n');

            newData += JSON.stringify(lines, null, 4);

            newData += '.join(\'\\n\');';

            fs.writeFile('./' + split[0] + '.js', newData, function(error) {});
        });
    });
});
