import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { first } from 'rxjs';
import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ContaCorrenteService } from '../contas/services/conta-corrente.service';
import { TransacaoService } from '../transactions/services/transacao.service';
import { ContaCorrente } from '../contas/models/conta-corrente.model';
import {
  valorPositivoValidator,
  semEspacoEmBrancoValidator,
  valorMaximoValidator,
} from '../../../shared/validators/validadores';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    NgClass,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MessageModule,
  ],
  templateUrl: './transferencia.component.html',
  styleUrl: './transferencia.component.css',
})
export class TransferenciaComponent implements OnInit {
  private readonly contaCorrenteService = inject(ContaCorrenteService);
  private readonly transacaoService = inject(TransacaoService);

  contas$ = this.contaCorrenteService.contas$;
  submetido = false;
  transferenciaRealizada = false;

  form!: FormGroup;

  ngOnInit(): void {
    this.contaCorrenteService.obterContas().subscribe({
      error: (err) => console.error('Erro ao carregar contas:', err),
    });
    this.inicializarFormulario();
  }

  private inicializarFormulario(): void {
    this.form = new FormGroup({
      contaOrigemId: new FormControl(null, [Validators.required]),
      contaDestinoId: new FormControl(null, [Validators.required]),
      descricao: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        semEspacoEmBrancoValidator(),
      ]),
      valor: new FormControl(null, [
        Validators.required,
        Validators.min(0.01),
        valorPositivoValidator(),
        valorMaximoValidator(100000),
      ]),
    });
  }

  // Atalho para verificar erros de um campo
  campoInvalido(campo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submetido);
  }

  // Atalho para obter FormControl
  campo(nome: string): FormControl {
    return this.form.get(nome) as FormControl;
  }

  // Retorna as contas disponíveis como opções, excluindo a conta de origem selecionada
  get contasDestino(): ContaCorrente[] {
    const contas = this.contaCorrenteService['contasSubject'].getValue();
    const origemId = this.form.get('contaOrigemId')?.value;
    return contas.filter((c) => c.id !== origemId);
  }

  get todasContas(): ContaCorrente[] {
    return this.contaCorrenteService['contasSubject'].getValue();
  }

  get contaDestinoSelecionada(): ContaCorrente | null {
    const id = this.form.get('contaDestinoId')?.value;
    if (!id) return null;
    return this.contaCorrenteService['contasSubject'].getValue()
      .find((c) => c.id == id) ?? null;
  }

  novaTransferencia(): void {
    this.transferenciaRealizada = false;
    this.submetido = false;
    this.inicializarFormulario();
  }

  onSubmit(): void {
    this.submetido = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { contaOrigemId, contaDestinoId, descricao, valor } = this.form.getRawValue();

    const contaOrigem = this.todasContas.find((c) => c.id == contaOrigemId) ?? null;
    const contaDestino = this.todasContas.find((c) => c.id == contaDestinoId)!;

    this.transacaoService
      .realizarTransferencia(contaOrigem, contaDestino, descricao, valor)
      .pipe(first())
      .subscribe({
        next: () => {
          this.transferenciaRealizada = true;
        },
        error: (err) => {
          // O MessageService já exibe o aviso de conta inativa
          console.error('Transferência não realizada:', err);
        },
      });
  }
}
