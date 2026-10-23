import { Equals, IsBoolean, IsOptional } from 'class-validator';

/** Aceptación de términos (registro y cuentas creadas antes del 22/10/2026). Ver src/user/aceptacion-terminos.ts. */
export class AceptarTerminosDto {
  @Equals(true, { message: 'STIRE es para personas de 18 años o más: confirma tu edad para continuar.' })
  confirmaMayorDeEdad!: boolean;

  @Equals(true, { message: 'Para usar STIRE debes aceptar los términos y la política de datos.' })
  aceptaTerminos!: boolean;

  @IsOptional()
  @IsBoolean({ message: 'La decisión sobre la investigación debe ser sí o no.' })
  consienteInvestigacion?: boolean;
}

/** Participar o dejar de participar en la investigación, cuando quiera (Decreto 1377, art. 9). */
export class DecisionInvestigacionDto {
  @IsBoolean({ message: 'La decisión sobre la investigación debe ser sí o no.' })
  consiente!: boolean;
}
