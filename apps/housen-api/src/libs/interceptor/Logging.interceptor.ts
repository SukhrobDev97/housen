import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger: Logger = new Logger();  
    public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const recordTime = Date.now();
      const requestType = context.getType<GqlContextType>();
      this.logger.log(`Type ${requestType}`, "REQUEST")
  
      if(requestType === "http"){
          //DEVELOP IF NEEDED;
      }else if(requestType === "graphql") {
          /* (1) PRINT REQUEST */
          const gqlContext = GqlExecutionContext.create(context);
          console.log("gqlContext =>", gqlContext.getContext().req.body)
          this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, "REQUEST")
  
          /* (2) IF ERROR, HANDLES WITH GRAPHQL*/
  
          /* !ERROR, GIVING RESPONSE BELOW */
          return next.handle().pipe(
              tap((context) => {
                  const responseTime = Date.now() - recordTime;
                  this.logger.log(`${this.stringify(context)} - ${responseTime}ms \n\n`, "RESPONSE")
              }
          ))
      }
  
    }
  
    private stringify (context: ExecutionContext): string {
      return JSON.stringify(context).slice(0, 75)
  }
  
}
