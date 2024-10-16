import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy {
  isOverlayVisible: boolean = false; // Controle do overlay
  title = 'cronometro';
  totalSeg: number = 0;
  startTimer: any;
  rodando = false;

  // Tempo de trabalho e pausa (em segundos)
  workTime: number = 24 * 60; // 25 minutos
  breakTime: number = 5 * 60; // 5 minutos
  isWorkSession: boolean = true; // Controla se é um período de trabalho ou pausa

  // -------- FORMS -------- //
  qBank = [
    { id: 1, question: "Qual o nome da doença que assolou o mundo em 2020?", options: ["COVID 19", "HIV", "H1N1", "Monkeypox"], answer: "COVID 19", selected: '' },
    { id: 2, question: "Qual o principal grão cultivado no Brasil?", options: ["Café", "Arroz", "Soja", "Milho"], answer: "Soja", selected: '' },
    { id: 3, question: "Qual das linguagens de programação à seguir não é orientada a objetos?", options: ["Python", "C", "C++", "Java"], answer: "C", selected: '' },
    { id: 4, question: "Qual das seguintes práticas é recomendada para evitar doenças?", options: ["Lavar as mãos", "Cobrir nariz e boca ao tossir", "Ventilar os ambientes", "Todas"], answer: "Todas", selected: '' },
    { id: 5, question: "Quais os 5 estados com maior produção agropecuária do Brasil?", options: ["Mato Grosso, São Paulo, Paraná, Rio Grande do Sul, Minas Gerais", "Mato Grosso do Sul, Bahia, Paraná, Rio Grande do Sul, Goiás", "Mato Grosso, Bahia, Pará, Rio Grande do Sul, Minas Gerais", "Mato Grosso, São Paulo, Paraná, Rio Grande do Norte, Goiás"], answer: "Mato Grosso, São Paulo, Paraná, Rio Grande do Sul, Minas Gerais", selected: '' }
  ];

  quizForm: FormGroup;
  score: number = 0;
  showResults: boolean = false;
  showQuiz: boolean = false;

  constructor(private fb: FormBuilder) {
    this.quizForm = this.fb.group({});
  }

  ngOnInit() {
    this.qBank.forEach(q => {
      this.quizForm.addControl(q.id.toString(), new FormControl(''));
    });

    document.addEventListener('fullscreenchange', this.handleFullScreenChange.bind(this));
    document.addEventListener('keydown', this.preventEscapeKey.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.handleFullScreenChange.bind(this));
    document.removeEventListener('keydown', this.preventEscapeKey.bind(this));
  }

  preventEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.showQuiz) {
      event.preventDefault();
      alert('Você não pode sair do modo de tela cheia enquanto o teste não for enviado.');
    }
  }

  onStartQuiz() {
    this.showQuiz = true;
    this.start(); // Inicia o cronômetro ao exibir o quiz
    this.enterFullScreen(); // Coloca em tela cheia ao iniciar o quiz
  }

  enterFullScreen() {
    const elem = document.documentElement; // Seleciona o elemento raiz da página

    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn(`Erro ao tentar entrar em tela cheia: ${err.message}`);
      });
    } else if ((<any>elem).webkitRequestFullscreen) {
      (<any>elem).webkitRequestFullscreen().catch((err: any) => {
        console.warn(`Erro ao tentar entrar em tela cheia: ${err.message}`);
      });
    }
  }

  handleFullScreenChange() {
    // Se o modo de tela cheia foi interrompido e o quiz ainda não foi concluído
    if (!document.fullscreenElement && this.showQuiz) {
        alert('Você não pode sair do modo de tela cheia enquanto o teste não for enviado.');

        // Tentativa de reentrar em modo de tela cheia
        const interval = setInterval(() => {
            this.enterFullScreen();
            // Verifica se a tela cheia foi ativada
            if (document.fullscreenElement) {
                clearInterval(interval); // Limpa o intervalo se bem-sucedido
            }
        }, 100); // Tenta a cada 100ms
    }
  }

  onSubmit() {
    this.score = 0;
    this.qBank.forEach(q => {
      const controlValue = this.quizForm.get(q.id.toString())?.value;
      q.selected = controlValue;
      if (controlValue === q.answer) {
        this.score++;
      }
    });
    this.showResults = true;
    this.stop(); // Para o cronômetro quando o teste é enviado
    this.exitFullScreen(); // Sai do modo tela cheia
    this.isOverlayVisible = false; // Oculta o overlay após o teste
  }

  exitFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn(`Erro ao tentar sair do modo tela cheia: ${err.message}`);
      });
    }
  }

  start(): void {
    if (!this.rodando) {
      this.rodando = true;
      this.totalSeg = this.isWorkSession ? this.workTime : this.breakTime;
      this.startTimer = setInterval(() => {
        if (this.totalSeg > 0) {
          this.totalSeg--;
        } else {
          this.isWorkSession = !this.isWorkSession;
          this.totalSeg = this.isWorkSession ? this.workTime : this.breakTime;
        }
      }, 1000);
    }
  }

  stop(): void {
    clearInterval(this.startTimer);
    this.rodando = false;
  }

  reset(): void {
    clearInterval(this.startTimer);
    this.rodando = false;
    this.totalSeg = 0;
    this.isWorkSession = true;
  }
}
