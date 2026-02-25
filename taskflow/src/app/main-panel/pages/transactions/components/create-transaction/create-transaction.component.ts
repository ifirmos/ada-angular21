import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { first } from 'rxjs';
import { TipoTransacao, Transacao } from '../../models/transacao.model';
import { TransacaoService } from '../../services/transacao.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-create-transaction',
  imports: [
    ReactiveFormsModule, 
    InputTextModule, 
    InputNumberModule, 
    SelectButtonModule, 
    ButtonModule,
    DatePickerModule
  ],
  templateUrl: './create-transaction.component.html',
  styleUrl: './create-transaction.component.css',
})
export class CreateTransactionComponent implements OnInit {
  private readonly transacaoService = inject(TransacaoService);

  @Output() transacaoCriada = new EventEmitter<void>();

  form!: FormGroup;
  tiposTransacao = [
    { label: 'Entrada', value: TipoTransacao.RECEITA },
    { label: 'Saída', value: TipoTransacao.DESPESA }
  ];

  ngOnInit(): void {
    this.form = new FormGroup({
      data: new FormControl(new Date(), [Validators.required]),
      descricao: new FormControl('', [Validators.required]),
      valor: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      tipo: new FormControl(TipoTransacao.RECEITA, [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const values = this.form.getRawValue();
    const payload: Transacao = {
      ...values,
      data: values.data.toISOString(),
      valor: (values.tipo === TipoTransacao.DESPESA ? -1 : 1) * values.valor
    };

    this.transacaoService
      .criarTransacao(payload)
      .pipe(first())
      .subscribe({
        next: () => {
          this.form.reset({ data: new Date(), tipo: TipoTransacao.RECEITA });
          this.transacaoCriada.emit();
        },
        error: (err) => {
          console.error('Erro ao criar transação:', err);
        },
      });
  }
}
