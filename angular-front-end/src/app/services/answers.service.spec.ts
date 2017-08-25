import { TestBed, inject } from '@angular/core/testing';

import { AnswersService } from './answers.service';

describe('AnswersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnswersService]
    });
  });

  it('should be created', inject([AnswersService], (service: AnswersService) => {
    expect(service).toBeTruthy();
  }));
});
