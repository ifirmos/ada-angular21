import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { first } from 'rxjs';
import { AsyncPipe, CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ContaCorrenteService } from './services/conta-corrente.service';
import { ContaCorrente } from './models/conta-corrente.model';
import {
  semEspacoEmBrancoValidator,
  naoApenasNumerosValidator,
} from '../../../shared/validators/validadores';

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    CurrencyPipe,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    ConfirmDialogModule,
  ],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.css',
})
export class ContasComponent implements OnInit {
  private readonly contaCorrenteService = inject(ContaCorrenteService);
  private readonly confirmationService = inject(ConfirmationService);

  contas$ = this.contaCorrenteService.contas$;
  mostrarFormulario = false;
  contaEmEdicao: ContaCorrente | null = null;
  submetido = false;

  form!: FormGroup;

  ngOnInit(): void {
    this.contaCorrenteService.obterContas().subscribe({
      error: (err) => console.error('Erro ao carregar contas:', err),
    });
    this.inicializarFormulario();
  }

  private inicializarFormulario(conta?: ContaCorrente): void {
    this.form = new FormGroup({
      nome: new FormControl(conta?.nome ?? '', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
        semEspacoEmBrancoValidator(),
        naoApenasNumerosValidator(),
      ]),
      agencia: new FormControl(conta?.agencia ?? '', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(10),
      ]),
      numeroConta: new FormControl(conta?.numeroConta ?? '', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(15),
      ]),
      ativa: new FormControl(conta?.ativa ?? true),
      // Saldo é preservado na edição; padrão 0 na criação
      saldo: new FormControl(conta?.saldo ?? 0),
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

  abrirFormulario(): void {
    this.contaEmEdicao = null;
    this.submetido = false;
    this.inicializarFormulario();
    this.mostrarFormulario = true;
  }

  editarConta(conta: ContaCorrente): void {
    this.contaEmEdicao = conta;
    this.submetido = false;
    this.inicializarFormulario(conta);
    this.mostrarFormulario = true;
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.contaEmEdicao = null;
    this.submetido = false;
  }

  onSubmit(): void {
    this.submetido = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dados: ContaCorrente = this.form.getRawValue();

    if (this.contaEmEdicao) {
      this.contaCorrenteService
        .atualizarConta({ ...this.contaEmEdicao, ...dados })
        .pipe(first())
        .subscribe({ next: () => this.cancelar() });
    } else {
      this.contaCorrenteService
        .criarConta(dados)
        .pipe(first())
        .subscribe({ next: () => this.cancelar() });
    }
  }

  alternarAtivacao(conta: ContaCorrente): void {
    this.contaCorrenteService
      .alternarAtivacao(conta)
      .pipe(first())
      .subscribe({
        error: (err) => console.error('Erro ao alternar ativação:', err),
      });
  }

  confirmarRemocao(conta: ContaCorrente): void {
    this.confirmationService.confirm({
      message: `Deseja remover a conta "${conta.nome}"?`,
      header: 'Confirmar remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.contaCorrenteService.removerConta(conta.id!).subscribe({
          error: (err) => console.error('Erro ao remover conta:', err),
        });
      },
    });
  }
}
