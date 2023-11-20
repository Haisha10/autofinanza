import { Component, Output, EventEmitter } from '@angular/core';
import { AxiosService } from '../../axios.service';
import { User } from 'src/app/models/user.model';
import { currentUser } from 'src/app/user-info';
import { Result } from 'src/app/models/result.model';


@Component({
  selector: 'app-auth-content',
  templateUrl: './auth-content.component.html',
  styleUrls: ['./auth-content.component.css']
})
export class AuthContentComponent {

  @Output() logoutEvent = new EventEmitter();

  data: User = currentUser;

  tipo_moneda: string = "sol";

  precio: number = 0;

  cuota_inicial: number = 0;
  isCuotaInicial: boolean = true;

  capital: number = 0;
  isCapital: boolean = true;

  banco: string = "";

  isNominal: boolean = true;
  isNominalCheckbox: boolean = true;
  valor_tasa_nominal: number = 0;
  capitalizacion: number = 0;

  isEfectiva: boolean = false;
  isEfectivaCheckbox: boolean = true;
  valor_tasa_efectiva: number = 0;

  frecuencia_pago: number = 0;

  inicio: Date = new Date();
  fin: Date = new Date();

  total_desde: number = 0;
  total_cantidad: number = 0;

  parcial_desde: number = 0;
  parcial_cantidad: number = 0;

  resultados: Result[] = [];



  constructor(private axiosService: AxiosService) { }

  ngOnInit(): void {
    /*
    this.axiosService.request(
        "GET",
        "/currentUser",
        {}).then(
        (response) => {
            this.data = response.data;
        }).catch(
        (error) => {
            if (error.response.status === 401) {
                this.axiosService.setAuthToken(null);
            } else {
                this.data = error.response.code;
            }

        }
    );
    */
  }

  scrollToElement(id: string): void {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  }

  verificarInicial(): void {
    if (this.cuota_inicial > 0) {
      this.isCuotaInicial = true;
      this.isCapital = false;
    }
    else if (this.capital > 0) {
      this.isCuotaInicial = false;
      this.isCapital = true;
    }
    else if (this.cuota_inicial == 0 && this.capital == 0) {
      this.isCuotaInicial = true;
      this.isCapital = true;
    }
    else {
      this.cuota_inicial = 0;
      this.capital = 0;
    }
  }

  desactivarTasa(): void {
    if (this.banco == "") {
      this.isNominalCheckbox = true;
      this.isEfectivaCheckbox = true;
    } else {
      this.isNominalCheckbox = false;
      this.isEfectivaCheckbox = false;
      this.isEfectiva = false;
      this.isNominal = false;
    }
  }

  checkboxChange(): void {
    if (this.isNominal && this.isEfectiva) {
      this.isNominal = false;
      this.isEfectiva = false;
    }
    else if (this.isNominal) {
      this.isEfectiva = false;
      this.isNominal = true;
    }
    else if (this.isEfectiva) {
      this.isNominal = false;
      this.isEfectiva = true;
    }
  }

  calcular(): void {
    //Calculo de la diferencia de años
    let diferenciaAnios: number = Math.floor(Math.abs(this.fin.getFullYear() - this.inicio.getFullYear()));
    console.log(diferenciaAnios);
    // Cantidad de periodos
    let periodos: number = 360 / this.frecuencia_pago * diferenciaAnios;
    let saldo_final: number = 0;

    //Escoger modo inicial
    if (this.isCuotaInicial && !this.isCapital) {
      saldo_final = this.precio - this.cuota_inicial;
    }
    else if (!this.isCuotaInicial && this.isCapital) {
      saldo_final = this.capital;
    }
    else {
      return;
    }

    //Calcular tasa final
    let tasa_interes: number = 0;
    let tasa_final: number = 0;
    if (this.isNominal) {
      tasa_interes = this.valor_tasa_nominal / 100;
      let m = this.capitalizacion;
      let n = this.capitalizacion;
      let tmp = ((1 + (tasa_interes / m)) ** n) - 1;
      tasa_final = ((1 + tmp) ** this.frecuencia_pago / 360) - 1;
    } else if (this.isEfectiva) {
      tasa_interes = this.valor_tasa_efectiva / 100;
      tasa_final = ((1 + tasa_interes) ** (this.frecuencia_pago / 360)) - 1;
    } else if (this.banco != "") {
      switch (this.banco) {
        case "bbva":
          tasa_interes = 0.1348;
          break;
        case "bcp":
          tasa_interes = 0.1344;
          break;
        case "banbif":
          tasa_interes = 0.1428;
          break;
        case "scotiabank":
          tasa_interes = 0.1107;
          break;
        case "santander":
          tasa_interes = 0.149;
          break;
        default:
          tasa_interes = 0;
          break;
      }
      tasa_final = ((1 + tasa_interes) ** (this.frecuencia_pago / 360)) - 1;
    }

    //Calendario
    let contador_periodo_gracia_total: number = this.total_cantidad;
    let contador_periodo_gracia_parcial: number = this.parcial_cantidad;
    let credito_capitalizado: number = saldo_final * (1 + tasa_final) ** this.total_cantidad;
    for (let i = 0; i <= periodos; i++) {
      if (i == 0) {
        this.resultados.push({
          n: i,
          gracia: "",
          saldo_inicial: 0,
          interes: 0,
          amortizacion: 0,
          cuota: 0,
          saldo_final: saldo_final
        });
      } else {
        if (contador_periodo_gracia_total > 0) {
          this.resultados.push({
            n: i,
            gracia: "T",
            saldo_inicial: saldo_final,
            interes: saldo_final * tasa_final,
            amortizacion: 0,
            cuota: 0,
            saldo_final: saldo_final + saldo_final * tasa_final
          });
          contador_periodo_gracia_total--;
        } else if (contador_periodo_gracia_parcial > 0) {
          this.resultados.push({
            n: i,
            gracia: "P",
            saldo_inicial: saldo_final,
            interes: saldo_final * tasa_final,
            amortizacion: 0,
            cuota: saldo_final * tasa_final,
            saldo_final: saldo_final + saldo_final * tasa_final
          });
          contador_periodo_gracia_parcial--;
        } else {
          this.resultados.push({
            n: i,
            gracia: "",
            saldo_inicial: saldo_final,
            interes: saldo_final * tasa_final,
            amortizacion: credito_capitalizado / this.total_cantidad,
            cuota: credito_capitalizado / this.total_cantidad + saldo_final * tasa_final,
            saldo_final: saldo_final + saldo_final * tasa_final - credito_capitalizado / this.total_cantidad
          });
          saldo_final = saldo_final + saldo_final * tasa_final - credito_capitalizado / this.total_cantidad;
        }
      }
    }
    console.log(this.resultados);
  }
}
