import { Component, Output, EventEmitter } from '@angular/core';
import { AxiosService } from '../../axios.service';
import { User } from 'src/app/models/user.model';
import { currentUser } from 'src/app/user-info';
import { Result } from 'src/app/models/result.model';
import { Data } from '@angular/router';
import { empty } from 'rxjs';


@Component({
  selector: 'app-auth-content',
  templateUrl: './auth-content.component.html',
  styleUrls: ['./auth-content.component.css']
})
export class AuthContentComponent {

  @Output() logoutEvent = new EventEmitter();

  isCalculo: boolean = false;

  user: User = currentUser;

  data: Data = {
    user_id: 0,
    tipo_moneda: "",
    precio: 0,
    cuota_inicial: 0,
    isCuotaInicial: true,
    capital: 0,
    isCapital: true,
    banco: "",
    isNominal: true,
    isNominalCheckbox: true,
    valor_tasa_nominal: 0,
    capitalizacion: 0,
    isEfectiva: false,
    isEfectivaCheckbox: true,
    valor_tasa_efectiva: 0,
    frecuencia_pago: 0,
    inicio: new Date(),
    fin: new Date(),
    total_desde: 0,
    total_cantidad: 0,
    parcial_desde: 0,
    parcial_cantidad: 0
  };

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
    this.axiosService.request(
      "GET",
      "/masterdata",
      {}).then(
        (response) => {
          this.data = response.data;
          console.log(this.data);
          if (!(this.data == null || this.data == undefined || this.data == empty)) {
            this.isCalculo = false;
          } else {
            this.isCalculo = true;
            this.tipo_moneda = this.data['tipo_moneda'];
            this.precio = this.data['precio'];
            this.cuota_inicial = this.data['cuota_inicial'];
            this.isCuotaInicial = this.data['isCuotaInicial'];
            this.capital = this.data['capital'];
            this.isCapital = this.data['isCapital'];
            this.banco = this.data['banco'];
            this.isNominal = this.data['isNominal'];
            this.isNominalCheckbox = this.data['isNominalCheckbox'];
            this.valor_tasa_nominal = this.data['valor_tasa_nominal'];
            this.capitalizacion = this.data['capitalizacion'];
            this.isEfectiva = this.data['isEfectiva'];
            this.isEfectivaCheckbox = this.data['isEfectivaCheckbox'];
            this.valor_tasa_efectiva = this.data['valor_tasa_efectiva'];
            this.frecuencia_pago = this.data['frecuencia_pago'];
            this.inicio = new Date(this.data['inicio']);
            this.fin = new Date(this.data['fin']);
            this.total_desde = this.data['total_desde'];
            this.total_cantidad = this.data['total_cantidad'];
            this.parcial_desde = this.data['parcial_desde'];
            this.parcial_cantidad = this.data['parcial_cantidad'];
            this.calcular();
          }
          this.calcular();
        }).catch(
          (error) => {
            if (error.response.status === 401) {
              this.axiosService.setAuthToken(null);
            } else {
              this.data = error.response.code;
            }

          }
        );
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
    this.inicio = new Date(this.inicio);
    this.fin = new Date(this.fin);
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
    let tasa_final: number = this.getTasaFinal();

    //Calendario
    let contador_periodo_gracia_total: number = this.total_cantidad;
    let contador_periodo_gracia_parcial: number = this.parcial_cantidad;
    let credito_capitalizado: number = saldo_final * (1 + tasa_final) ** this.total_cantidad;
    let tmp_saldo_inicial: number = 0;
    let tmp_interes: number = 0;
    let tmp_amortizacion: number = 0;
    let tmp_cuota: number = 0;
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
          tmp_saldo_inicial = saldo_final;
          tmp_amortizacion = 0;
          tmp_interes = tmp_saldo_inicial * tasa_final;
          tmp_cuota = 0;
          saldo_final = tmp_saldo_inicial + tmp_interes;
          this.resultados.push({
            n: i,
            gracia: "T",
            saldo_inicial: tmp_saldo_inicial,
            interes: tmp_saldo_inicial * tasa_final,
            amortizacion: tmp_amortizacion,
            cuota: tmp_cuota,
            saldo_final: saldo_final
          });
          contador_periodo_gracia_total--;
        } else if (contador_periodo_gracia_parcial > 0) {
          tmp_saldo_inicial = saldo_final;
          tmp_amortizacion = 0;
          tmp_interes = tmp_saldo_inicial * tasa_final;
          tmp_cuota = tmp_amortizacion + tmp_interes;
          saldo_final = tmp_saldo_inicial + tmp_amortizacion;
          this.resultados.push({
            n: i,
            gracia: "P",
            saldo_inicial: tmp_saldo_inicial,
            interes: tmp_interes,
            amortizacion: tmp_amortizacion,
            cuota: tmp_cuota,
            saldo_final: saldo_final
          });
          contador_periodo_gracia_parcial--;
        } else {
          tmp_cuota = credito_capitalizado * ((tasa_final * ((1 + tasa_final) ** (periodos - (this.total_cantidad + this.parcial_cantidad)))) / (((1 + tasa_final) ** (periodos - (this.total_cantidad + this.parcial_cantidad))) - 1));
          tmp_saldo_inicial = saldo_final;
          tmp_interes = tmp_saldo_inicial * tasa_final;
          tmp_amortizacion = tmp_cuota - tmp_interes;
          saldo_final = tmp_saldo_inicial - tmp_amortizacion;
          this.resultados.push({
            n: i,
            gracia: "S",
            saldo_inicial: tmp_saldo_inicial,
            interes: tmp_interes,
            amortizacion: tmp_amortizacion,
            cuota: tmp_cuota,
            saldo_final: saldo_final
          });
        }
      }
    }
    this.isCalculo = true;
    this.postData();
  }

  getTasaFinal(): number {
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
    return tasa_final
  }

  sumaInteres(): number {
    let suma: number = 0;
    this.resultados.forEach((element) => {
      suma += element.interes;
    });
    return suma;
  }

  sumaAmortizacion(): number {
    let suma: number = 0;
    this.resultados.forEach((element) => {
      suma += element.amortizacion;
    });
    return suma;
  }

  sumaCuota(): number {
    let suma: number = 0;
    this.resultados.forEach((element) => {
      suma += element.cuota;
    });
    return suma;
  }

  getFrecuenciaPago(): string {
    if (this.frecuencia_pago == 30) {
      return "Mensual";
    }
    else if (this.frecuencia_pago == 60) {
      return "Bimestral";
    }
    else if (this.frecuencia_pago == 90) {
      return "Trimestral";
    }
    else if (this.frecuencia_pago == 120) {
      return "Cuatrimestral";
    }
    else if (this.frecuencia_pago == 180) {
      return "Semestral";
    }
    else if (this.frecuencia_pago == 360) {
      return "Anual";
    }
    else {
      return "";
    }
  }

  getVanVal(): number {
    let van: number = 0;
    for (let i = 0; i < this.resultados.length; i++) {
      if (i == 0) {
        van += (this.resultados[i].cuota * -1);
      }
      else {
        van += (this.resultados[i].cuota / ((1 + this.getTasaFinal()) ** i));
      }
    }
    return van;
  }

  getVanResult(): string {
    if (this.getVanVal() > 0) {
      return "El proyecto es rentable";
    }
    else if (this.getVanVal() < 0) {
      return "El proyecto no es rentable";
    }
    else {
      return "El proyecto es indiferente";
    }
  }

  getTirVal(): number {
    const tolerancia = 0.0001; //Tolerancia para la convergencia
    let tir: number = 0.1; // Suposición inicial

    if (this.resultados.length == 0) {
      return 0;
    }
    var nuevaTir: number = Number.MAX_VALUE;
    while (Math.abs(nuevaTir - tir) >= tolerancia) {
      let vpn = 0;
      let derivada = 0;

      for (let t = 0; t < this.resultados.length; t++) {
        vpn += this.resultados[t].cuota / Math.pow((1 + tir), t);
        derivada -= t * this.resultados[t].cuota / Math.pow((1 + tir), t + 1);
      }

      nuevaTir = tir - vpn / derivada;

      if (Math.abs(nuevaTir - tir) < tolerancia) {
        return nuevaTir;
      }

      tir = nuevaTir;
    }

    return tir;
  }

  getTirResult(): string {
    if (this.getTirVal() > this.getTasaFinal()) {
      return "El proyecto es rentable";
    }
    else if (this.getTirVal() < this.getTasaFinal()) {
      return "El proyecto no es rentable";
    }
    else {
      return "El proyecto es indiferente";
    }
  }

  postData(): void {
    this.data = {
      user_id: this.user.id,
      tipo_moneda: this.tipo_moneda,
      precio: this.precio,
      cuota_inicial: this.cuota_inicial,
      isCuotaInicial: this.isCuotaInicial,
      capital: this.capital,
      isCapital: this.isCapital,
      banco: this.banco,
      isNominal: this.isNominal,
      isNominalCheckbox: this.isNominalCheckbox,
      valor_tasa_nominal: this.valor_tasa_nominal,
      capitalizacion: this.capitalizacion,
      isEfectiva: this.isEfectiva,
      isEfectivaCheckbox: this.isEfectivaCheckbox,
      valor_tasa_efectiva: this.valor_tasa_efectiva,
      frecuencia_pago: this.frecuencia_pago,
      inicio: this.inicio,
      fin: this.fin,
      total_desde: this.total_desde,
      total_cantidad: this.total_cantidad,
      parcial_desde: this.parcial_desde,
      parcial_cantidad: this.parcial_cantidad
    };
    this.axiosService.request(
      "POST",
      "/masterdata",
      this.data).then(
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

  }
}
