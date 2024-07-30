import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { LetDirective } from './let.directive';

describe('LetDirective: diretiva estrutural usada para tornar disponível uma variável em um template context', () => {
  @Component({
    template: `
      <div>
        <ng-container *appLet="value as data">{{ data }}</ng-container
        ><ng-container *appLet="value; let data">{{ data }}</ng-container>
      </div>
    `,
  })
  class TestSimpleComponent {
    value = 'test';
  }
  describe('caso simples', () => {
    let fixture: ComponentFixture<TestSimpleComponent>;
    let debugElement: DebugElement;
    let element: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestSimpleComponent],
        imports: [LetDirective],
      });
      fixture = TestBed.createComponent(TestSimpleComponent);
      debugElement = fixture.debugElement;
      element = debugElement.nativeElement;
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    it('cria um contexto com o valor passado como parâmetro', () => {
      fixture.detectChanges();
      expect(element.textContent).toBe('testtest');
    });
  });

  @Component({ template: '<div *appLet="value | async; let data">{{data}}</div>' })
  class TestAsyncComponent {
    value: Observable<string> = of('test');
  }

  describe('em associação com async pipe', () => {
    let fixture: ComponentFixture<TestAsyncComponent>;
    let debugElement: DebugElement;
    let element: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestAsyncComponent],
        imports: [LetDirective],
      });
      fixture = TestBed.createComponent(TestAsyncComponent);
      debugElement = fixture.debugElement;
      element = debugElement.nativeElement;
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    it('cria um contexto com o valor passado como parâmetro associado ao async pipe', () => {
      fixture.detectChanges();
      expect(element.textContent).toBe('test');
    });
  });

  // tslint:disable-next-line: max-line-length
  @Component({
    template: `
      <div *appLet="value as data">
        <ng-container *appLet="nestedValue as nestedData">{{ data }}-{{ nestedData }}</ng-container>
      </div>
    `,
  })
  class TestNestedComponent {
    value = 'test';
    nestedValue = 'testNested';
  }

  describe('[appLet] aninhados', () => {
    let fixture: ComponentFixture<TestNestedComponent>;
    let debugElement: DebugElement;
    let element: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestNestedComponent],
        imports: [LetDirective],
      });
      fixture = TestBed.createComponent(TestNestedComponent);
      debugElement = fixture.debugElement;
      element = debugElement.nativeElement;
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    it('pode ser usado em elementos aninhados', () => {
      fixture.detectChanges();
      expect(element.textContent).toBe('test-testNested');
    });
  });

  describe('compilador ivy', () => {
    it('ngTemplateContextGuard retorna verdadeiro', () => {
      expect(
        LetDirective.ngTemplateContextGuard(null as unknown as LetDirective<unknown>, null),
      ).toBeTrue();
    });
  });
});
