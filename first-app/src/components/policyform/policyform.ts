import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Policy } from '../../models/policy';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policyform.html'
})
export class PolicyForm implements OnInit {
  @Input() policy?: Policy; 
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  apiUrl = 'http://localhost:3000/policies';

  formData: Policy = {
    id: '',
    name: '',
    type: 'health',
    premium: 0,
    coverage: 0,
    duration: 1,
    description: '',
    features: [],
    createdAt: ''
  };

  featureInput = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.policy) {
      // Use a copy so the table doesn't change until we hit 'Update'
      this.formData = JSON.parse(JSON.stringify(this.policy));
    }
  }

  addFeature() {
    if (this.featureInput.trim()) {
      this.formData.features.push(this.featureInput.trim());
      this.featureInput = '';
    }
  }

  removeFeature(index: number) {
    this.formData.features.splice(index, 1);
  }

  // Inside PolicyForm class

submit() {
  if (this.policy) {
    // EDIT: Use PUT
    this.http.put(`${this.apiUrl}/${this.formData.id}`, this.formData).subscribe(() => {
      this.saved.emit(); // Tells parent to run onSaved()
    });
  } else {
    // ADD: Use POST
    const newId = 'P' + Math.floor(Math.random() * 1000);
    const newPolicy = { ...this.formData, id: newId };
    
    this.http.post(this.apiUrl, newPolicy).subscribe(() => {
      this.saved.emit(); // Tells parent to run onSaved()
    });
  }
}
}