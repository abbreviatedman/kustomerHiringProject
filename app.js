var submitCustomerToKustomer = function(customer) {
  var bearerToken = 'Bearer ' + API_KEY;
  var kustomerPostConfig = {
    url: KUSTOMER_URL,
    method: 'post',
    data: customer,
    headers: {
      'Authorization': bearerToken
    }
  };
  axios(kustomerPostConfig)
    .then(function(response) {
      console.log('Customer ' + customer.name + ' at email: ' + customer.emails[0].email + ' was created with the following response: ', response)
    })
    .catch(function(error) {
      console.log('Customer ' + customer.name + ' at email: ' + customer.emails[0].email + ' failed to enter the database, with the following error: ', error)
    });
};

var convertObjectToCustomer = function(object) {
  var customer = {};
  customer.name = '';
  if (object.firstName) {
    customer.name += object.firstName;
    if (object.lastName) {
      customer.name += ' ' + object.lastName;
    }
  } else if (object.lastName) {
    customer.name += object.lastName;
  }
  if (object.email) {
    customer.emails = [{
      email: object.email,
      type: 'home'
    }];
  }
  if (object.workPhone || object.homePhone) {
    customer.phones = [];
    if (object.workPhone) {
      var workPhone = {
        phone: object.workPhone.toString(),
        type: 'work'
      };
      customer.phones.push(workPhone);
    }
    if (object.homePhone) {
      var homePhone = {
        phone: object.homePhone.toString(),
        type: 'home'
      };
      customer.phones.push(homePhone);
    }
  }
  if (object.birthday) {
    var date = new Date(object.birthday);
    customer.birthdayAt = date.toISOString();
  }
  if (object.customerType) {
    customer.custom = {
      customerTypeStr: object.customerType
    };
  }
  return customer;
};

var convertCsvToObjs = function(csv) {
  var objects = [];
  var splitRE = /,\s*(?=(?:[^"]|"[^"]*")*$)/g;
  var deleteRE = /^"|"$|\\|&lt;|%3C|&gt;|%3E/g;
  var lines = csv.split(/\r\n|\n/);

  var headers = lines[0].split(',');
  for (var i = 1; i < lines.length; i++) {
    var currentLine = [].map.call(lines[i].split(splitRE), function(el) {
      return el.replace(deleteRE, '');
    });
    var lineObj = {};
    for (var j = 0; j < headers.length; j++) {
      lineObj[headers[j]] = currentLine[j];
    }
    objects.push(lineObj);
  }
  return objects;
};

var loadHandler = function(event) {
  var csv = event.target.result;
  var objects = convertCsvToObjs(csv);
  var customers = objects.map(function(object) {
    return convertObjectToCustomer(object);
  });
  customers.forEach(function(customer) {
    submitCustomerToKustomer(customer);
  });
};

var errorHandler = function(evt) {
  if (evt.target.error.name === 'NotReadableError') {
    console.error('Cannot read file!');
  }
};

var getAsText = function(fileToRead) {
  var reader = new FileReader();
  reader.readAsText(fileToRead);
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
};

var handleFiles = function(files) {
  if (window.FileReader) {
    getAsText(files[0]);
  } else {
    console.error('FileReader support not present in current browser.');
  }
};
