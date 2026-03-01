import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { first } from 'rxjs';
import { TipoTransacao, Transacao } from '../../models/transacao.model';
import { TransacaoService } from '../../services/transacao.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import {
  valorPositivoValidator,
  semEspacoEmBrancoValidator,
  dataNaoFuturaValidator,
  naoApenasNumerosValidator,
  valorMaximoValidator,
} from '../../../../../shared/validators/validadores';

@Component({
  selector: 'app-create-transaction',
  imports: [
    ReactiveFormsModule,
    NgClass,
    InputTextModule,
    InputNumberModule,
    SelectButtonModule,
    ButtonModule,
    DatePickerModule,
  ],
  templateUrl: './create-transaction.component.html',
  styleUrl: './create-transaction.component.css',
})
export class CreateTransactionComponent implements OnInit {
  private readonly transacaoService = inject(TransacaoService);

  @Output() transacaoCriada = new EventEmitter<void>();

  form!: FormGroup;
  submetido = false;

  tiposTransacao = [
    { label: 'Entrada', value: TipoTransacao.RECEITA },
    { label: 'Saída', value: TipoTransacao.DESPESA },
  ];

  ngOnInit(): void {
    this.form = new FormGroup({
      data: new FormControl(new Date(), [
        Validators.required,
        dataNaoFuturaValidator(),
      ]),
      descricao: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        semEspacoEmBrancoValidator(),
        naoApenasNumerosValidator(),
      ]),
      valor: new FormControl(null, [
        Validators.required,
        Validators.min(0.01),
        valorPositivoValidator(),
        valorMaximoValidator(999999.99),
      ]),
      tipo: new FormControl(TipoTransacao.RECEITA, [Validators.required]),
    });
  }

  // Atalho para verificar erros de um campo específico
  campoInvalido(campo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submetido);
  }

  // Atalho para obter o FormControl
  campo(nome: string): FormControl {
    return this.form.get(nome) as FormControl;
  }

  onSubmit(): void {
    this.submetido = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const payload: Transacao = {
      ...values,
      data: values.data.toISOString(),
      valor: values.valor,
    };

    this.transacaoService
      .criarTransacao(payload)
      .pipe(first())
      .subscribe({
        next: () => {
          this.submetido = false;
          this.form.reset({ data: new Date(), tipo: TipoTransacao.RECEITA });
          this.transacaoCriada.emit();
        },
        error: (err) => {
          console.error('Erro ao criar transação:', err);
        },
      });
  }
}

