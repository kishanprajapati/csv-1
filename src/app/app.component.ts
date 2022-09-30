import { Component } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Message,MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService]
})
export class AppComponent {

  constructor(){}

  authorsList: any[] = [];
  booksList: any[] = [];
  magazinesList: any[] = [];
  presentData:any[] = [];
  showTable: boolean = false;
  message: Message[] = [];

  headers:any[] = ['type','title','isbn','authors','description','publishedAt'];

  showData(event: any){
    let files = event.files;
    if(files.length !== 3){
      this.message = [
        {severity:'error', summary:'Error', detail:'Please select all 3 files!'}
      ]
    }

    if(files.length === 3){

      this.authorsList = [];
      this.booksList = [];
      this.magazinesList = [];
      this.presentData = [];

      let reader1: FileReader = new FileReader();
      let reader2: FileReader = new FileReader();
      let reader3: FileReader = new FileReader();

      let authorsFile = files.map((file:any) => file.name).indexOf('authors.csv');
      let booksFile = files.map((file:any) => file.name).indexOf('books.csv');
      let magazinesFile = files.map((file:any) => file.name).indexOf('magazines.csv');

      if(authorsFile === -1){
        this.message = [
          {severity:'error', summary:'Error', detail:'Author File Is Not Found!'}
        ]
      } else if(booksFile === -1){
        this.message = [
          {severity:'error', summary:'Error', detail:'Books File Is Not Found!'}
        ]
      } else if(magazinesFile === -1){
        this.message = [
          {severity:'error', summary:'Error', detail:'Magazines File Is Not Found!'}
        ]
      }

      reader1.readAsText(files[authorsFile]);
      reader2.readAsText(files[booksFile]);
      reader3.readAsText(files[magazinesFile]);

      reader1.onload = (e) => {
        let csv: any = reader1.result;
        let lines = csv.split(/\r|\n|\r/);
        let data = [];
        let totalLines = lines.length;

        for (let i = 1; i < totalLines; i++){
          if(lines[i] !== ""){
            data.push(lines[i].split(';'));
          }
        }

        data.forEach(author => {
          this.authorsList.push ({
            email: author[0].replace('null-',''),
            name: author[1],
            lastname: author[2]
          });
        });
      }

      reader2.onload = (e) => {
        let csv: any = reader2.result;
        let lines = csv.split(/\r|\n|\r/);
        let totalLines = lines.length;
        let data = [];

        for (let i = 1; i < totalLines; i++){
          if(lines[i] !== ""){
            data.push(lines[i].split(';'));
          }
        }

        data.forEach((book) => {
          let authorsCred = book[2].split(',');
          authorsCred = authorsCred.map((x:any) => x.replace('null-',''))
          this.booksList.push({
            title: book[0],
            isbn: book[1],
            authors: authorsCred,
            description: book[3]
          });
        });

        this.booksList.forEach(book => {
          this.presentData.push({
            type: "Book",
            title: book.title,
            isbn: book.isbn,
            description: book.description,
            authors: book.authors,
            publishedAt: "-"
          });
        });
      }

      reader3.onload = (e) => {
        let csv: any = reader3.result;
        let lines = csv.split(/\r|\n|\r/);
        let totalLines = lines.length;
        let data = [];

        for(let i = 1; i < totalLines; i++){
          if(lines[i] !== ""){
            data.push(lines[i].split(';'));
          }
        }

        data.forEach(mag =>{
          let authorsCred = mag[2].split(',');
          authorsCred = authorsCred.map((x:any) => x.replace('null-',''))
          this.magazinesList.push({
            title: mag[0],
            isbn: mag[1],
            authors: authorsCred,
            publishedAt: mag[3],
          });
        });

        this.magazinesList.forEach(book => {
          this.presentData.push({
            type: "Magazine",
            title: book.title,
            isbn: book.isbn,
            authors: book.authors,
            publishedAt: book.publishedAt,
            description: "-"
          });
        });
      }
      this.showTable = true;
    }
  }

  getAuthorsName(authorEmail: any) {
    let author = this.authorsList.find(x => x.email === authorEmail);
    return author.name+" "+author.lastname+" - ("+author.email+")";
  }

  sendValue(event:any){
    return (event.target as HTMLInputElement).value;
  }

  createCsv(headers: any, csvData: any){
    if(!csvData || !csvData.length){
      return;
    }
    const seprator = ';';
    const csvContent = headers.join(seprator) + '\n' + csvData.map((rowData:any)=>{
      return headers.map((headKey:any)=>{
        return rowData[headKey] 
        === 
        null || rowData[headKey]
        ===
        undefined ? '': rowData[headKey];
      }).join(seprator);
    }).join('\n');

    this.exportFile(csvContent,'text/csv');
  }

  exportFile(data: any, fileType: string){
    const blob = new Blob([data] , { type: fileType });
    FileSaver.saveAs(blob, 'Downloaded Csv')
  }

  downloadCsv(){
    let newData = this.presentData.map((x)=>{
      let authors = x.authors;
      let authorsDetails = [];
      for(let x of authors){
        authorsDetails.push(this.getAuthorsName(x).replace(' - ',''));
      }
      return {
        type: x.type,
        title: x.title,
        isbn: x.isbn,
        description: x.description,
        authors: authorsDetails,
        publishedAt: x.publishedAt
      }
    });

    this.createCsv(this.headers, newData);
  }
}