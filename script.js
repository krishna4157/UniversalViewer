const script = `let fileInput = document.getElementById('fileInput')
let viewer = document.getElementById('viewer')
let workBook = null
let excelGrid = null
let activeSheet = ''
let sheets = []
let excelButtons = null
let buttons = []

// <button v-for="(sheet, index) in sheets" :key="index" @click="showSheet(sheet)" :class="{'active': activeSheet === sheet}">{{sheet}}</button>
window.handleApiResponse = function(data) {
  // alert(JSON.stringify(data));
  let payload = data;
  showExcel(data);
  if(!data) {
      console.error("No data provided");
      return;
  }
      if(typeof data === 'string' && data.indexOf('base64,') !== -1) {
           payload = base64ToUint8Array(data.split('base64,')[1]);

      }
      if (typeof data === 'string' && payload[payload.length -1] == '"') {

      try{
          const jsonData = JSON.parse(data);
          payload = jsonData;
      } catch (error) {
          console.error("Error parsing JSON:", error);
      }
      }
      if (typeof data !== 'string') {
        console.log("File not string");
      }


      var binary;
      try {
          binary = base64ToUint8Array(payload);
          showExcel(binary);
      } catch (error) {
          console.error("Error decoding base64:", error);
      }
};

function base64ToUint8Array(base64) {

  // Decode the Base64 string to a binary string
  const binaryString = atob(base64);

  // Get the length of the binary string
  const length = binaryString.length;

  // Create a Uint8Array to hold the binary data
  const bytes = new Uint8Array(length);

  // Iterate through the binary string and populate the Uint8Array
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
      alert("FILE");

  return bytes;
}

function getFile (e) {
    var reader = new FileReader()
    reader.readAsBinaryString(e.target.files[0])
    reader.onload = function () {
      showExcel(reader.result)
    }
    reader.onerror = function (error) {
      console.log('error', error)
    }
}

fileInput.addEventListener('change', getFile)


function showSheet(el) {
    let buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.classList.remove('active'));
    el.classList.add('active');

    const sheetName = el.innerText;
    const workSheet = workBook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });

    const chunkSize = 50;
    let currentIndex = 0;

    function renderChunk() {
        const table = document.createElement('table');
        table.classList.add('table', 'table-bordered', 'table-responsive', 'excel-table');

        const endIndex = Math.min(currentIndex + chunkSize, jsonData.length);
        for (let i = currentIndex; i < endIndex; i++) {
            const row = document.createElement('tr');
            jsonData[i].forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell || '';
                row.appendChild(td);
            });
            table.appendChild(row);
        }

        excelGrid.innerHTML = '';
        excelGrid.appendChild(table);

        if (endIndex < jsonData.length) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.classList.add('btn', 'btn-secondary', 'mt-2');
            loadMoreBtn.onclick = () => {
                currentIndex += chunkSize;
                renderChunk();
            };
            excelGrid.appendChild(loadMoreBtn);
        }
    }

    renderChunk();
    activeSheet = sheetName;
}


function clearAll () {
    viewer.innerHTML = ""
    workBook = null
    excelGrid = null
    sheets = []
    excelButtons = null
    buttons = []
}




function showExcel (data) {
    clearAll()
    workBook = XLSX.read(data, {type: 'binary'})
    console.log(workBook)
    sheets = workBook.SheetNames
    workBook.SheetNames.forEach(function (sheetName) {
      // Get headers.
      var headers = []
      var sheet = workBook.Sheets[sheetName]
      var range = XLSX.utils.decode_range(sheet['!ref'])
      var C = range.s.r
      var R = range.s.r
      /* start in the first row */
      /* walk every column in the range */
      for (C = range.s.c; C <= range.e.c; ++C) {
        var cell = sheet[XLSX.utils.encode_cell({c: C, r: R})]
        /* find the cell in the first row */
        var hdr = 'NIPUN'
        if (cell && cell.t) {
          hdr = XLSX.utils.format_cell(cell)
        }
        headers.push(hdr)
      }
      // For each sheets, convert to json.
      var roa = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName])
      if (roa.length > 0) {
        roa.forEach(function (row) {
          // Set empty cell to ''.
          headers.forEach(function (hd) {
            if (row[hd] === undefined) {
              row[hd] = ''
            }
          })
        })
      }
    })
    excelGrid = document.createElement('table')
    excelGrid.classList.add('table')
    excelGrid.classList.add('table-bordered')
    excelGrid.classList.add('table-responsive')
    excelGrid.classList.add('excel-table')
    excelButtons = document.createElement('div')
    excelButtons.classList.add('excelButtons')
    for (var i = 0; i < sheets.length; i++) {
      let button = document.createElement('button')
      button.classList.add('sheetBtn')
      button.innerText = sheets[i]
      button.addEventListener('click', (e) => {
        showSheet(e.target)
      })
      excelButtons.appendChild(button)
      buttons.push(button)
    }
    let container = document.createElement('div')
    container.classList.add('excel-container')
    container.appendChild(excelGrid)
    viewer.innerHTML = ""
    viewer.appendChild(container)
    viewer.appendChild(excelButtons)
    // self.excelGrid = canvasDatagrid({
    //   parentNode: document.getElementById('pdf-viewer'),
    //   data: []
    // })
    // self.excelGrid.style.width = '100%'
    // self.excelGrid.style.height = '100%'

    // self.excelGrid.style.gridBackgroundColor = 'white'
    // self.excelGrid.style.cellFont = '14px sans-serif'
    showSheet(buttons[0])
  }`

  export default script;
