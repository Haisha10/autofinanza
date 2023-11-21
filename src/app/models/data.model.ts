export interface Data {
  user_id: number;
  tipo_moneda: string;
  precio: number;
  cuota_inicial: number;
  isCuotaInicial: boolean;
  capital: number;
  isCapital: boolean;
  banco: string;
  isNominal: boolean;
  isNominalCheckbox: boolean;
  valor_tasa_nominal: number;
  capitalizacion: number;
  isEfectiva: boolean;
  isEfectivaCheckbox: boolean;
  valor_tasa_efectiva: number;
  frecuencia_pago: number;
  inicio: Date;
  fin: Date;
  total_desde: number;
  total_cantidad: number;
  parcial_desde: number;
  parcial_cantidad: number;
}
