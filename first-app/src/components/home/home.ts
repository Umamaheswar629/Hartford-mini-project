import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Enquiryservice } from '../../services/enquiryservice';
@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
})
export class Home {
  private enquiryService=inject(Enquiryservice);
    enquiry = {
    fullName: '',
    email: '',
    phone: '',
    type: '',
    message: ''
  };

  onSubmit() {
  this.enquiryService.postEnquiry(this.enquiry).subscribe({
      next: (res) => {
        console.log('Enquiry saved to DB:', res);
        alert('Thank you! Your enquiry has been submitted and will be reviewed by our team.');
        
        this.enquiry = {
          fullName: '',
          email: '',
          phone: '',
          type: '',
          message: ''
        };
      },
      error: (err) => {
        console.error('Submission failed', err);
        alert('Could not submit enquiry. Please try again later.');
      }
    });
  }
}

