export class AppConstants {

  // File information
  public static CSV_INPUT_SEPARATOR = '   ';
  public static CSV_OUTPUT_SEPARATOR = ' ';
  public static TIME_SEPARATOR = ':';
  public static CSV_MIME_TYPE = 'text/csv;charset=utf-8;';

  // Time difference
  public static START_OF_DAY: Date = new Date(2021, 0, 1, 0, 0, 0, 0);

  // Input fields validation patterns
  public static PATTERN_COORDINATES_CLOCK_DELTA = /^([0-9]|0[0-9]|1?[0-9]|2[0-3]):[0-5]?[0-9]:[0-5]?[0-9]$/;
  public static PATTERN_DEPTHS_HEIGHT_DELTA = /^\d*\.?\d*$/;
  public static PATTERN_OUTPUT_FILENAME = /[^\\\/:*?"<>|\r\n]+$/;

  // Error messages
  public static ERROR_COORDINATES_FILE = '<br/> • Невалиден файл с координати';
  public static ERROR_COORDINATES_FILE_CONTENT = '<br/> • Невалидни данни във файла с координати';
  public static ERROR_COORDINATES_CLOCK_DELTA = `<br/> • Невалидна разлика в часовниците - формат "hh:mm:ss"`;
  public static ERROR_DEPTHS_FILE = '<br/> • Невалиден файл с дълбочини';
  public static ERROR_DEPTHS_FILE_CONTENT = '<br/> • Невалидни данни във файла с дълбочини';
  public static ERROR_DEPTHS_HEIGHT_DELTA = `<br/> • Невалидна височина на антената - формат "m.cm"`;
  public static ERROR_OUTPUT_FILE = `<br/> • Невалидно име на файла с резултати`;

  // Calculation messages
  public static SUCCESS_CALCULATION = 'Пресмятането на изходните данни завърши успешно!';
  public static PARTIAL_CALCULATION = 'Пресмятането на изходните данни завърши <b>С ЧАСТИЧНО ОТКРИТИ</b> съвпадащи координати и дълбочини!';
  public static NO_CALCULATION = 'Пресмятането на изходните данни завърши <b>БЕЗ ОТКРИТИ</b> съвпадащи координати и дълбочини!';
  public static ERROR_CALCULATION = 'Изникна проблем при пресмятането на изходните данни!';
}
