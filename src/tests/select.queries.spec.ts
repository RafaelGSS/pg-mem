import 'mocha';
import 'chai';
import { newDb } from '../db';
import { expect, assert } from 'chai';
import { IMemoryDb } from '../interfaces';
import { preventSeqScan } from './test-utils';
import { Types } from '../datatypes';

describe('[Queries] Selections', () => {

    let db: IMemoryDb;
    let many: (str: string) => any[];
    let none: (str: string) => void;
    beforeEach(() => {
        db = newDb();
        many = db.public.many.bind(db.public);
        none = db.public.none.bind(db.public);
    });

    function simpleDb() {
        db.public.declareTable({
            name: 'data',
            fields: [{
                id: 'id',
                type: Types.text(),
                primary: true,
            }, {
                id: 'str',
                type: Types.text(),
            }, {
                id: 'otherStr',
                type: Types.text(),
            }],
        });
        return db;
    }

    it('can use transformations', () => {
        // preventSeqScan(db);
        expect(many(`create table test(txt text, val integer);
                insert into test values ('A', 999);
                insert into test values ('A', 0);
                insert into test values ('A', 1);
                insert into test values ('B', 2);
                insert into test values ('C', 3);
                select * from (select val as xx from test where txt = 'A') x where x.xx >= 1`))
            .to.deep.equal([{ xx: 999 }, { xx: 1 }]);
    });


    it('can use an expression on a transformed selection', () => {
        // preventSeqScan(db);
        expect(many(`create table test(txt text, val integer);
                insert into test values ('A', 999);
                insert into test values ('A', 0);
                insert into test values ('A', 1);
                insert into test values ('B', 2);
                insert into test values ('C', 3);
                select *, lower(txtx) as v from (select val as valx, txt as txtx from test where val >= 1) x where lower(x.txtx) = 'a'`))
            .to.deep.equal([{ txtx: 'A', valx: 999, v: 'a' }, { txtx: 'A', valx: 1, v: 'a' }]);
    });


    it('selects case whithout condition', () => {
        simpleDb();
        expect(many(`insert into data(id, str) values ('id1', 'SOME STRING'), ('id2', 'other string'), ('id3', 'Some String');
            select case when id='id1' then 'one ' || str else 'something else' end as x from data`))
            .to.deep.equal([{ x: 'one SOME STRING' }, { x: 'something else' }, { x: 'something else' }]);
    })

    it('selects case with disparate types results', () => {
        simpleDb();
        expect(many(`select case when 2 > 1 then 1.5 when 2 < 1 then 1 end as x`))
            .to.deep.equal([{ x: 1.5 }]);
    })

    it('does not support select * on dual', () => {
        assert.throw(() => many(`select *`));
    });

    it('supports concat operator', () => {
        expect(many(`select 'a' || 'b' as x`))
            .to.deep.equal([{ x: 'ab' }]);
    });

});