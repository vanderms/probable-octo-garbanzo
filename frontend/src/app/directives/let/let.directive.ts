import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface LetContext<T> {
  appLet: T;
  $implicit: T;
}

@Directive({
  selector: '[appLet]',
})
export class LetDirective<T> {
  private context: LetContext<T | null> = { appLet: null, $implicit: null };
  private hasView = false;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<LetContext<T>>
  ) {}

  @Input()
  set appLet(value: T) {
    this.context.$implicit = this.context.appLet = value;
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef, this.context);
      this.hasView = true;
    }
  }

  public static appLetUseIfTypeGuard: void;

  static ngTemplateGuard_appLet: 'binding';

  // eslint-disable-next-line no-unused-vars
  static ngTemplateContextGuard<T>(
    dir: LetDirective<T>,
    ctx: unknown
  ): ctx is LetContext<T> {
    return true;
  }
}
