import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { NgForm } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth.service';
import { Route, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Form } from '../../../../../public/assets/suite_gpl/codebase/suite';
import { PdfService } from './pdf.service';


@Component({
  selector: 'app-authorization',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './authorization.component.html',
  styleUrl: './authorization.component.scss'
})
export class AuthorizationfireproofingnumberComponent {


  private apiUrl = environment.apiUrl;
  loading = false
  isOpenFireproofAdd = false
  fireprrofForm: FormGroup;
  constructor(private http: HttpClient, private fb: FormBuilder, private router: Router, private authService: AuthService,private pdfService: PdfService) {

    this.fireprrofForm = this.fb.group({

      company_code: [this.companyCode],
      certified_products_classification_code: ['', Validators.required],
      authorization_fireproofing_weight: '',
      provisional_authorization_fireproofing_company_code: '',
      fire_performance_fireproof_undercoat_number: '',
      fire_performance_fireproof_plaster_number: '',
      fire_performance_quasi_incombustible_number: '',
      fire_performance_metal_number: '',
      fire: ''


    });
  }

  async fireprrof_data() {

    if (this.fireprrofForm.invalid) {
      this.fireprrofForm.markAllAsTouched();
      return;
    }

    if (this.fireprrofForm.valid) {


      console.log("value", this.fireprrofForm.value)
      let formValue = this.fireprrofForm.value

      try {
        const response = await this.authService.addFireproofApi(formValue)
        alert("Fireproof Added Success")
        this.fireprrofForm.reset()
        this.isOpenFireproofAdd = false

      } catch (err) {

        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            alert("Certified Number is Not Exit");
          } else if (err.status === 400) {
            alert("Company And Certified Number is exit");
          }
        } else {
          alert("An unexpected error occurred.");
        }

      }

    }

  }

  fireGrouping = '';
  match_fire_grouping(): void {
    let certified_data = this.fireprrofForm.get('certified_products_classification_code')?.value
    if (certified_data != '') {

      const matchedGrouping = this.fireproofList.find(

        data => data.certified_products_classification_code === certified_data
      );

      this.fireGrouping = matchedGrouping ? matchedGrouping.certified_group : '';

    } else {
      alert("not data")
    }

  }


  companyData: any[] = []

  async ngOnInit() {

    this.companyData = await this.fetchCompanyData();
  }

  initializeDropdown(): void {

  }
  showSubMenu(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const subMenu = target.querySelector('ul');
    if (subMenu) {
      subMenu.style.display = 'block';
    }
  }

  hideSubMenu(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const subMenu = target.querySelector('ul');
    if (subMenu) {
      subMenu.style.display = 'none';
    }
  }
// -----------------------------Create PDF --------------------------------------------

CreatePDF() {
  // Check if ministerList is empty
  if (this.fireproofList.length === 0) {
      alert('There is no data in the table');
      return; // Exit the function if there's no data
  } else {
      this.pdfService.generatePdf(this.fireproofList);
      console.log(this.fireproofList);
  }
}

  // -------------------window show------------------------------
  private dhxwindow: any;

  ngAfterViewInit(): void {
    this.initializeWindow();
  }

  initializeWindow(): void {

  }

  fcnShowonetimecode(): void {
    this.dhxwindow.show();
  }


  companyName = ''
  company_code_select: string = ''
  fireproofList: any[] = []
  company_code = ''
  companyCode: string = ''; // To hold the company_code

  async doSearch(page = 1, limit = 20) {

    const company_code = this.company_code_select ? this.company_code_select : this.company_code;
    // Check if both values are filled and different
    if (this.company_code && this.company_code_select && this.company_code !== this.company_code_select) {
      alert('The entered company code and selected company code do not match.');
      return; // Exit the function if they are not the same
    }

    try {

      this.fireproofList = []
      this.companyName = ''
      this.loading = true
      let response;

      // Call the API to fetch all user data if input is empty
      response = await this.allFireproofApi(page, limit, company_code);
      console.log("res", response)
      this.fireproofList = response;
      console.log(this.fireproofList)
      this.loading = false

      this.totalPages = Math.ceil(response[0]['total_count'] / limit)
        ;
      this.pages = []
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i)

      }

      if (response[0].company_code === company_code) {
        this.companyName = response[0].company_name;
        this.companyCode = response[0].company_code;
      }


      this.fireprrofForm.patchValue({
        company_code: this.companyCode // Initialize the form control
      });

    } catch (err) {

      alert("No Data Found")
      this.loading = false
    }

  }



  currentPage: number = 1;
  totalPages: any = '';
  pages: number[] = []
  onPageChange(page: number): void {
    this.currentPage = page;
    this.doSearch(this.currentPage);
  }
  selectedIndex: number | null = null;
  selectedData: any = null
  selectRow(index: number) {
    if (this.selectedIndex === index) {
      // Deselect the row if it is already selected
      this.selectedIndex = null;
    } else {
      // Select the new row
      this.selectedIndex = index;
      this.selectedData = this.fireproofList[index]

    }
  }
  isOpenfireproofEdit = false;
  fireproofAdd() {

    this.isOpenFireproofAdd = true

  }

  fireproofEdit() {
    this.isOpenfireproofEdit = true
  }
  async fireproofEditForm(form: NgForm) {

    if (form.valid) {
      const updatedData = form.value;
      //checkbox data fetch  

      try {
        const response = await this.authService.updateFireprooftingApi(this.selectedData.document_id, updatedData);
        this.doSearch()
        alert("Fireproof Updated Successfully")
        this.isOpenfireproofEdit = false
      } catch (err) {

        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            alert("Token is Missing");
          }
        } else {
          alert("An unexpected error occurred.");
        }
      }

    }

  }
  async deleteFireproof(document_id: string) {

    if (confirm("Are you sure you want to Sure Delete?")) {

      try {

        const res = await this.authService.deleteFireproofApi(this.selectedData.document_id)
        this.doSearch()
        alert("Fireproof Delete Successfully")
        this.isOpenfireproofEdit = false

      } catch (err) {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            alert("Token Missing");
          } else {
            alert("An error occurred while deleting the fireproof. Please try again.");
          }
        } else {
          alert("An unexpected error occurred.");
        }
      }
    }

  }
  close() {
    this.isOpenfireproofEdit = false
    this.isOpenFireproofAdd = false
    this.fireprrofForm.reset()
    this.fireGrouping = '';
  }



  private async fetchCompanyData(): Promise<any[]> {
    const companyUrl = `${this.apiUrl}/api/company_lists`;
    return firstValueFrom(this.http.get<any[]>(companyUrl));
  }



  private async allFireproofApi(page: number = 1, limit: number = 500, company_code?: string): Promise<any> {

   // let fireproofUrl = `http://127.0.0.1:5001/wacoa-4b37f/us-central1/httpsflaskexample/api/fireproof/list`;
     let fireproofUrl = `${this.apiUrl}/api/fireproof/list`;
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (company_code) params.append('company_code', company_code);
    fireproofUrl += `?${params.toString()}`;
    return firstValueFrom(this.http.get<any>(fireproofUrl));
  }
}
