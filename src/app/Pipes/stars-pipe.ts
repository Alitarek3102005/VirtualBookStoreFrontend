import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stars'
})
export class StarsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {  

    if (typeof value === 'number') {
      const fullStars = Math.floor(value);
      const halfStar = value - fullStars >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
    }
    return '';
  }

}
