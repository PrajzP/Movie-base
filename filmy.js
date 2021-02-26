/* program baza filmów.
ścieżka poleceń - C:\PPRA - laptop\moje\node> node filmy.js
brak bazy danych / stworzenie pliku, zamknięcie pliku bazy

++, data obejrzenia filmu, zapamiętanie rozmiarów kolumn i wierszy,
*/
const xlsx = require ('xlsx');
const ścieżka = 'baza filmów.xlsx'
const plik = xlsx.readFile(ścieżka); // plik = workbook
//const plikSave = xlsx.writeFile('baza filmów.xlsx');

const colors = require('colog');
//var fs = require('fs');

//fs.watchFile

const readline = require('readline');
const { promisify } = require('util');
const { execFile } = require('child_process');
//const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const rl = readline.createInterface({ input : process.stdin, 
                                      output: process.stdout});

rl.setPrompt('-->');
var wsNazwa = plik.SheetNames[0]; // odwołanie do pierwszego arkusza, niezależnie od jego nazwy. / ws = plik.Sheets['Filmy'];
var ws = plik.Sheets[wsNazwa];

var data = xlsx.utils.sheet_to_json(ws); //zmiana na json

start(); // szukaj po gatunku. wyrzucić zmianę oceny z menu filmów
var newData; // nowe dane wprowadzane do nowego workbooka
var memoryFilm = 0; // tablica znalezionych filmów. jeżeli jest tyko 1, to film jest wprawadzony do wybranyFilm
var szukaneZnalezione = []; // filmy znalezione po szukaniu wg kryteriów
var pytanieP; // pytanie do UI dodania filmów
//var nieKasujMemoryFilm = false; // nie pozwala skasować tablicy z filmami
var filmWBazie; 
var wyświetlSzczegóły = false; // prezentowanie stron z filmami (po 4) po 'enter'
var newMovie = { // dodawanie filmu
    //Date : '',
    Title : '',
    Type : '',
    Stars : '',
    Description : '',
    Director : '',
    Actors : ''
}

// ---------------------- USER INPUT ----------------
function userInput() { // UI M.GŁÓWNE (0)
    var odpowiedź = '@';    //zmienna do której przypisana będzie wprowadzony string
    rl.question(`\n-->`, (dane) => {    // read line
        //rl.on('line', (dane) => {
        odpowiedź = dane.toLocaleLowerCase().trim(); //zmniejszenie czcionki i usunięcie spacji
        menuGłówne(odpowiedź);  // uruchomienie funkcji z wprowadzonym argumentem

    });
}
function userInputFilmy() { // UI M.FILMY (1)
    var odpowiedźF = '@';
    rl.question(`\n-->`, (dane) => {
        odpowiedźF = dane.toLocaleLowerCase().trim();
        menuFilmy(odpowiedźF);
    });
}
function userInputSzczegółyFilm() { // UI SZCZEGÓŁY FILMU (1,1)
    var odpowiedźSF = '@';
    rl.question(`\n-->`, (dane) => {
        odpowiedźSF = dane.toLocaleLowerCase().trim();
        menuSzczegółyFilm(odpowiedźSF);
    });
}
function userInputNoweFilmy() { // UI NOWE FILMY (2)
    var odpowiedźNF = '@';
    rl.question(`\n-->`, (dane) => {
        odpowiedźNF = dane.toLocaleLowerCase().trim();
        menuNoweFilmy(odpowiedźNF);
    });
}
function userInputSzczegółyNoweFilmy() { // UI SZCZEGÓŁY NOWE FILMY (2,1)
    var odpowiedźSNF = '@';
    rl.question(`\n-->`, (dane) => {
        odpowiedźSNF = dane.toLocaleLowerCase().trim();
        menuSzczegółyNoweFilmy(odpowiedźSNF);
    });
}
function userInputOceń() { // UI OCENA (2,2)
    var odpowiedźO = '@';
        rl.question('\nOcena filmu: ', (dane) => {
            odpowiedźO = dane.toLocaleLowerCase().trim();
            oceń(odpowiedźO);
        });
}
function userInputSzukanie() { // UI SZUKANIE (3)
    var odpowiedźS = '@';
    rl.question(`\n-->`, (dane) => {
        odpowiedźS = dane.toLocaleLowerCase().trim();
        menuSzukanie(odpowiedźS);
    });
}
function userInputSzukanieLitera() { // UI SZUKANIE PO LITERZE MENU (3,1)
        var odpowiedźSL = '@';
        rl.question(`\nPodaj pierwszą literę tytułu szukanego filmu:\n-->`, (dane) => {
            odpowiedźSL = dane.toLocaleLowerCase().trim();
            menuSzukanieLitera(odpowiedźSL);
        });
}
function userInputSzukanieOcena() { // UI SZUKANIE OCENA (3,2)
        var odpowiedźSO = '@';
        rl.question(`\nPodaj ocenę lub zakres ocen oddzielony znakiem "-" :\n-->`, (dane) => {
            odpowiedźSO = dane.toLocaleLowerCase().trim();
            menuSzukanieOcena(odpowiedźSO);
        });
}
function userInputSzukanieGatunek() { // UI SZUKANIE PO GATUNKU (3,3)
    var odpowiedźSG = '@';
        rl.question(`\n-->`, (dane) => {
            odpowiedźSG = dane.toLocaleLowerCase().trim();
            menuSzukanieGatunek(odpowiedźSG);
        });
}
function userInputEdycja() { // UI WYBÓR PODMENU EDYCJI (E)
    var odpowiedźEO = '@';
        rl.question('\nWybierz pole do edycji: ', (dane) => {
            odpowiedźEO = dane.toLocaleLowerCase().trim();
            menuEdycja(odpowiedźEO);
        });
}
function userInputEdycjaPole() { // UI WYBÓR POLA DO EDYCJI (E)
    var odpowiedźEP = '@';
        rl.question(pytanieP, (dane) => {
            odpowiedźEP = dane.trim();
            edycjaPole(odpowiedźEP);
        });
}
function userInputDodajFilm() { // UI DODAWANIA FILMÓW (+)
    var odpowiedźDF = '@';
        rl.question(pytanieP, (dane) => {
            odpowiedźDF = dane.trim();
            dodajFilm(odpowiedźDF);
        });
}
function userInputSzukanieDowolne() { // UI SZUKANIE PO LITERZE MENU (3,1)
    var odpowiedźSD = '@';
    rl.question(`\nPodaj tytuł filmu: `, (dane) => {
        odpowiedźSD = dane.toLocaleLowerCase().trim();
        menuSzukanieDowolne(odpowiedźSD);
    });
}

//---------------- MENU --------------------------
function menuGłówne(arg) { // MENU GŁÓWNE (0)
    var szczegółyInfo = 0; // informacja o ostatnim zapytaniu, czy była o wszyskie filmy czy jeden. 0 - brak, 1 - jeden, 2 - wszystkie
    var memoryFilm = [];    // tablica z zapamiętanymi filmami po wyszukaniu

    switch(arg){
        case 'help' :
        case 'h' :
            console.clear();    // wyczyszczenie konsoli
            obrazMenuGłówne();  // funkcja obrazu menu
            pomoc();            // funkcja pomocy
            userInput();        // funckja read line
            break;
        case 'filmy':
        case 'f' :
        case 'w' :
            console.clear();
            obrazMenuFilmy();
            tytuły();
            userInputFilmy();
            break;
        case 'nowe' :
        case 'n' :
            console.clear();
            obrazMenuNoweFilmy();
            noweFilmy();
            userInputNoweFilmy();
            break;
        case 'szukaj' :
        case 's' :
            console.clear();
            obrazMenuSzukanie();
            userInputSzukanie();
            break;
        case 'exit' :
        case 'e' :
            console.clear();
            wyjście();
            break;
        case 'menu' :
        case 'm' :
            console.log('Jesteś w menu głównym');
            userInput();
            break;
        case 'info' :
        case 'i':
            console.clear();
            obrazMenuGłówne();
            autor();
            userInput();
            break;
        case '+' :
        case 'd' :
        case 'dodaj' :
            console.clear();
            obrazMenuGłówne();
            krok = 0;
            dodajFilm('');
        break;
        default : console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc.')
        userInput();
            break;
    }
}
function menuFilmy(arg) { //  MENU FILMY (1)
    memoryFilm = [];
    szczegółyInfo = 0;
        switch(arg) {
            case '' :
                console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                userInputFilmy();
                break;
            case 'help' :
            case 'h' :
                console.clear();
                obrazMenuFilmy();
                tytuły(); 
                pomocFilmy();
                userInputFilmy();
            break;
            case 'szczegóły' :
            case '1' :
                console.clear();
                obrazMenuSzczegółyFilm();
                    wskaźnik = 4; // ile filmów na stronie
                    next = true; // następna strona
                    strona = 1; // strona wyświetlanych filmów
                    stronaMax = Math.ceil(data.length/wskaźnik); // max strona wyświetlanych szczegółów filmów
                szczegóły();
                userInputSzczegółyFilm();
            break;
            case 'menu' :
            case 'm' :
                console.clear();
                obrazMenuGłówne();
                userInput();
            break;
            case 'nowe' :
            case 'n' :    
                console.clear();
                obrazMenuNoweFilmy();
                noweFilmy();
                userInputNoweFilmy();
                break;
            case 'w' :
            case 'filmy':
            case 'f' :
                console.log('Jesteś w tym menu.');
                userInputFilmy();
                break;
            case 'szukaj' :
            case 's' :
                console.clear();
                obrazMenuSzukanie();
                userInputSzukanie();
                break;
            case 'exit' :
            case 'e' :
                console.clear();
                wyjście();
            break;
            case '+' :
            case 'd' :
            case 'dodaj' :
                console.clear();
                obrazMenuGłówne();
                krok = 0;
                dodajFilm('');
            break;
            default:
                szukanieTytułów(arg);
                if (memoryFilm.length == 0 ) {
                //if (filmWBazie == false) { //Xnowe3
                   console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                   userInputFilmy();
                }
                else
                {
                    console.clear();
                    obrazMenuSzczegółyFilm();
                    
                    for (i=0; i<memoryFilm.length; i++) {
                        szczegółyFilm(memoryFilm[i]);
                    }
                    userInputSzczegółyFilm();
                }
            break;
        }
}
function menuSzczegółyFilm(arg) { // MENU SZCZEGÓŁY FILMU/FILMÓW (1,1) ----- zmiana helpa - exit/edycja
    let strona;
    //nieKasujMemoryFilm = false;
        switch(arg) {
            case '' :
                if (wyświetlSzczegóły == true) { // Xnowe
                next = true;
                szczegóły();
                }
                else {
                    console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                    userInputSzczegółyFilm();
                }
                break;
            case 'help' :
            case 'h' :
                console.clear();
                obrazMenuSzczegółyFilm();
                switch(szczegółyInfo) {
                    case 0 : 
                        break;
                    case 1 :
                        for (i=0; i<memoryFilm.length; i++) {
                            szczegółyFilm(memoryFilm[i]);
                        }
                        break;
                    case 2 :
                        szczegóły(); break;
                    default : console.log('ERR: szczegółyInfo', szczegółyInfo); break;
                }
                pomocSzczegółyFilm();
                userInputSzczegółyFilm();
                break;
                case '1' :
                    console.log('Jesteś w tym menu.');
                    userInputSzczegółyFilm();
                    break;
            case 'nowe' :
            case 'n' :
                console.clear();
                obrazMenuNoweFilmy();
                noweFilmy();
                userInputNoweFilmy();
                break;
            case 'w' :
            case 'filmy':
            case 'f' :
                console.clear();
                obrazMenuFilmy();
                tytuły();
                userInputFilmy();
                break;
            case 'szukaj' :
            case 's' :
                console.clear();
                obrazMenuSzukanie();
                userInputSzukanie();
                break;
            case 'menu' :
            case 'm' :
                console.clear();
                obrazMenuGłówne();
                userInput();
                break;
            case 'exit' :
            case 'e' :
                console.clear();
                wyjście();
                break;
            case 'edycja' :
                if (zezwolenie() == true) {
                    newData = data;
                    menuInfo = 1;
                    console.clear();
                    obrazMenuSzczegółyFilm();
                    odstęp();
                    obrazEdycja(wybranyFilm);
                    userInputEdycja();
                }
                userInputSzczegółyFilm();
                break;
            case '-' :
            case 'u' :
                if (zezwolenie() == true) {
                    usuńFilm(memoryFilm[0]);
                }
                else console.log('Wybierz tylko jeden film!');
                userInputSzczegółyFilm();
                break;
            case 'usuń' :
                    usuńWiele(memoryFilm);
                break;
            default:
                //nieKasujMemoryFilm = true;
                szukanieTytułów(arg);
                //if (memoryFilm.length == 0) {
                if (filmWBazie == false) { //Xnowe
                    console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                    userInputSzczegółyFilm();
                }
                else {
                    console.clear();
                    obrazMenuSzczegółyFilm();
                    for (i=0; i<memoryFilm.length; i++) {
                        szczegółyFilm(memoryFilm[i]);
                    }
                    userInputSzczegółyFilm();
                }
                break;
        }
}
function menuNoweFilmy(arg) { // MENU NOWE FILMY (2)
    szczegółyInfo = 0;
    memoryFilm = [];
        switch(arg) {
            case '' :
                console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                userInputNoweFilmy();
                break;
            case 'help' :
            case 'h' :
                console.clear();
                obrazMenuNoweFilmy();
                noweFilmy();
                pomocFilmy();
                userInputNoweFilmy();
            break;
            case 'szczegóły' :
            case '1' :
                console.clear();
                obrazMenuSzczegółyNoweFilmy();
                    wskaźnik = 4; // ile filmów na stronie
                    next = true; // następna strona
                    strona = 1; // strona wyświetlanych filmów
                    stronaMax = Math.ceil(ileNowychFilmów / wskaźnik); // max strona wyświetlanych szczegółów filmów
                szczegółyNoweFilmy();
                userInputSzczegółyNoweFilmy();
                break;
            case '2' :
            case 'oceń' :
                if (zezwolenie() == false) {
                    console.log('Wybierz jeden film.');
                    userInputNoweFilmy();
                }
                if (zezwolenie() == true) {
                    userInputOceń();
                }
                break;
            case 'nowe' :
            case 'n' :
                console.log('Jesteś w tym menu.');
                userInputNoweFilmy();
                break;
            case 'w' :
            case 'filmy':
            case 'f' :
                console.clear();
                obrazMenuFilmy();
                tytuły();
                userInputFilmy();
                break;
            case 'szukaj' :
            case 's' :
                console.clear();
                obrazMenuSzukanie();
                userInputSzukanie();
                break;
            case 'menu' :
            case 'm' :
                console.clear();
                obrazMenuGłówne();
                userInput();
            break;
            case '+' :
            case 'd' :
            case 'dodaj' :
                console.clear();
                obrazMenuGłówne();
                krok = 0;
                dodajFilm('');
            break;
            case 'exit' :
            case 'e' :
                console.clear();
                wyjście();
            break;
            default:
                szukanieTytułówNowych(arg);
                if (memoryFilm.length == 0 ) {
                //if (szukanieTytułówNowych == false) {
                   console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                   userInputNoweFilmy();
                }
                else
                {
                    console.clear();
                    obrazMenuSzczegółyNoweFilmy();
                    for (i=0; i<memoryFilm.length; i++) {
                        szczegółyFilm(memoryFilm[i]);
                    }
                    userInputSzczegółyNoweFilmy();
                }
            break;
        }
}
function menuSzczegółyNoweFilmy(arg) { // MENU SZCZEGÓŁY NOWE FILMY (2,1)
    let strona;
    //nieKasujMemoryFilm = false;

        switch(arg) {
            case '' :
                if (wyświetlSzczegóły == true) {
                next = true;
                szczegółyNoweFilmy();
                }
                else {
                    console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                    userInputSzczegółyNoweFilmy();
                }
                break;
            case 'help' :
            case 'h' :
                switch(szczegółyInfo) {
                    case 0 : 
                        break;
                    case 1 :
                        console.clear();
                        obrazMenuSzczegółyNoweFilmy();
                        for (i=0; i<memoryFilm.length; i++) {
                            szczegółyFilm(memoryFilm[i]);
                        }
                        pomocSzczegółyFilm();
                        userInputSzczegółyNoweFilmy();
                        break;
                    case 2 :
                        console.clear();
                        obrazMenuSzczegółyNoweFilmy();
                        szczegółyNoweFilmy();
                        pomocSzczegółyFilm();
                        userInputSzczegółyNoweFilmy();
                        break;
                    default : console.log('ERR: szczegółyInfo', szczegółyInfo); break;
                }
            break;
            case 'szczegóły' :
            case '1' :
                console.log('Jesteś w tym menu.');
                userInputSzczegółyNoweFilmy();
            break;
            case '2' :
            case 'oceń' :
                if (zezwolenie() == false) {
                    console.log('Wybierz jeden film do oceny.');
                    userInputNoweFilmy();
                }
                if (zezwolenie() == true) {
                    userInputOceń();
                }
                break;
            case 'nowe' :
            case 'n' :
                console.clear();
                obrazMenuNoweFilmy();
                noweFilmy();
                userInputNoweFilmy();
                break;
            case 'w' :
            case 'filmy':
            case 'f' :
                console.clear();
                obrazMenuFilmy();
                tytuły();
                userInputFilmy();
                break;
            case 'szukaj' :
            case 's' :
                console.clear();
                obrazMenuSzukanie();
                userInputSzukanie();
                break;
            case 'menu' :
            case 'm' :
                console.clear();
                obrazMenuGłówne();
                userInput();
            break;
            case 'exit' :
            case 'e' :
                console.clear();
                wyjście();
            break;
            case 'edycja' :
                if (zezwolenie() == true) {
                    newData = data;
                    menuInfo = 2;
                    console.clear();
                    obrazMenuSzczegółyNoweFilmy();
                    odstęp();
                    obrazEdycja(wybranyFilm);
                    userInputEdycja();
                }
                userInputSzczegółyNoweFilmy();
                break;
                case '-' :
                case 'u' :
                if (zezwolenie() == true) {
                    usuńFilm(memoryFilm[0]);
                }
                else console.log('Wybierz tylko jeden film!');
                userInputSzczegółyFilm();
                break;
                case 'usuń' :
                    usuńWiele(memoryFilm);
                    break;
            default:
                //nieKasujMemoryFilm = true;
                szukanieTytułówNowych(arg);
                //if (memoryFilm.length == 0 ) {
                if (filmWBazie == false) { //Xnowe
                   console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                   userInputSzczegółyNoweFilmy();
                }
                else
                {
                    console.clear();
                    obrazMenuSzczegółyNoweFilmy();
                    for (i=0; i<memoryFilm.length; i++) {
                        szczegółyFilm(memoryFilm[i]);
                    }
                    userInputSzczegółyNoweFilmy();
                }
            break;
        }
}
function menuSzukanie(arg) { // MENU SZUKANIA (3)
    var szukaneZnalezione = []; // filmy znalezione po szukaniu wg kryteriów
    switch(arg){
        case '' :
            console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc.')
            userInputSzukanie();
            break;
        case '1' :
        case 'litera' :
        case 'l' :
            console.clear();
            obrazMenuSzukanieLitera();
            userInputSzukanieLitera();
            break;
        case '2' :
        case 'ocena' :
        case 'o' :
            console.clear();
            obrazMenuSzukanieOcena();
            userInputSzukanieOcena();
            break;
        case '3' :
        case 'gatunek' :
        case 'g' :
            console.clear();
            obrazMenuSzukanieGatunek();
            gatunkiInfo();
            userInputSzukanieGatunek();
            break;
        case '4' :
        case 'd' :
        case 'dowolne' :
            console.clear();
            obrazMenuSzukanieDowolne();
            userInputSzukanieDowolne();
            break;
        case 'help' :
        case 'h' :
            console.clear();
            obrazMenuSzukanie();
            pomocSzukanie();
            userInputSzukanie();
            break;
        case 'filmy':
        case 'f' :
        case 'w' :
            console.clear();
            obrazMenuFilmy();
            tytuły();
            userInputFilmy();
            break;
        case 'nowe' :
        case 'n' :
            console.clear();
            obrazMenuNoweFilmy();
            noweFilmy();
            userInputNoweFilmy();
            break;
            case 'szukaj' :
            case 's' :
                console.log('Jesteś w tym menu.');
                userInputSzukanie();
                break;
        case 'exit' :
        case 'e' :
            console.clear();
            wyjście();
            break;
        case 'menu' :
        case 'm' :
            console.clear();
            obrazMenuGłówne();
            userInput();
            break;
        default : 
            console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc.')
            userInputSzukanie();
            break;
    }
    return szukaneZnalezione;
}
function menuSzukanieLitera(arg) { // MENU SZUKANIA PO LITERZE (3,1)
    switch(arg) {
        case 'help' :
            console.clear();
            obrazMenuSzukanieLitera();
            pomocSzukanieLitera();
            userInputSzukanieLitera();
            break;
        case 'menu' :
            console.clear();
            obrazMenuGłówne();
            userInput();
            break;
        case 'exit' :
            console.clear();
            wyjście();
            break;
        case 'edycja' :
            if (zezwolenie() == true) {
                newData = data;
                menuInfo = 31;
                console.clear();
                obrazMenuSzukanieGatunek();
                odstęp();
                obrazEdycja(wybranyFilm);
                userInputEdycja();
            }
            userInputSzukanieGatunek();
            break;
        case '-' :
            if (zezwolenie() == true) {
                usuńFilm(memoryFilm[0]);
            }
            else console.log('Wybierz tylko jeden film!');
            userInputSzukanieLitera();
            break;
        case 'szukaj' :
            console.clear();
            obrazMenuSzukanie();
            userInputSzukanie();
            break;
        case 'a' :
        case 'ą' :
        case 'b' :
        case 'c' :
        case 'ć' :
        case 'd' :
        case 'e' :
        case 'ę' :
        case 'f' :
        case 'g' :
        case 'h' :
        case 'i' :
        case 'j' :
        case 'k' :
        case 'l' :
        case 'ł' :
        case 'm' :
        case 'n' :
        case 'ń' :
        case 'o' :
        case 'ó' :
        case 'p' :
        case 'q' :
        case 'r' :
        case 's' :
        case 'ś' :
        case 't' :
        case 'u' :
        case 'v' :
        case 'w' :
        case 'x' :
        case 'z' :
        case 'ź' :
        case 'ż' :
        case '0' :
        case '1' :
        case '2' :
        case '3' :
        case '4' :
        case '5' :
        case '6' :
        case '7' :
        case '8' :
        case '9' :
            console.clear();
            obrazMenuSzukanieLitera();
            szukaneZnalezione = []; // reset tablicy znalezionych poprzednio filmów.
            szukaj(arg);
            userInputSzukanieLitera();
            break;
        default :
            if (szukaneZnalezione.length != 0) {
                szukanieTytułówWybranych(arg);

                if (memoryFilm.length == 0 ) {
                    console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                    userInputSzukanieLitera();
                }
                else
                {
                    console.clear();
                    obrazMenuSzukanieLitera();
                    for (i=0; i<memoryFilm.length; i++) {
                        szczegółyFilm(memoryFilm[i]);
                    }
                }
                userInputSzukanieLitera();
            }
            else{
                console.log('Błędne polecenie. Wpisz "HELP" aby uzyskać pomoc.');
                userInputSzukanieLitera();
            }
            break;
    }
}
function menuSzukanieOcena(arg) { // MENU SZUKANIA PO OCENIE (3,2)
    let o1, o2; // oceny
    let zakres = 0; // miejsce które oddziela oceny w stringu arg
    let err = false; // błąd przy wprowadzaniu danych

    if (arg.length > 1) {
        for (i=0; i<arg.length; i++)
        {
            if (arg[i] == '-')
            {
                zakres = i;
            }
        }
    }
    switch(zakres) {
        case 0 :
            if ((arg < 0) ||(arg > 10)) err= true;
            switch(arg) {
                case ' ' :
                case '   ' :
                    err = true;
                    break;
                case '0' :
                case '1' :
                case '2' :
                case '3' :
                case '4' :
                case '5' :
                case '6' :
                case '7' :
                case '8' :
                case '9' :
                case '10' :
                    console.clear();
                    obrazMenuSzukanieOcena();
                    szukaneZnalezione = [];
                    szukajOcena(arg);
                    userInputSzukanieOcena();
                    break;
                case 'm' :
                case 'menu' :
                case '' :
                    console.clear();
                    obrazMenuGłówne();
                    userInput();
                    break;
                case 'edycja' :
                    if (zezwolenie() == true) {
                        newData = data;
                        menuInfo = 32;
                        console.clear();
                        obrazMenuSzukanieOcena();
                        odstęp();
                        obrazEdycja(wybranyFilm);
                        userInputEdycja();
                    }
                    userInputSzukanieOcena();
                    break;
                case 'exit' :
                    console.clear();
                    wyjście();
                    break;
                case 'h' :
                case 'help' :
                    console.clear();
                    obrazMenuSzukanieOcena();
                    pomocSzukanieOcena();
                    userInputSzukanieOcena();
                    break;
                case '-' :
                case 'u' :
                    if (zezwolenie() == true) {
                        usuńFilm(memoryFilm[0]);
                    }
                    else console.log('Wybierz tylko jeden film!');
                    userInputSzukanieOcena();
                    break;
                case 's' :
                case 'szukaj' :
                    console.clear();
                    obrazMenuSzukanie();
                    userInputSzukanie();
                    break;
                default :
                    if (szukaneZnalezione.length != 0) {
                        err = false;
                        szukanieTytułówWybranych(arg);

                        if (memoryFilm.length == 0 ) {
                            err = true;
                        }
                        else {
                            console.clear();
                            obrazMenuSzukanieOcena();
                            for (i=0; i<memoryFilm.length; i++) {
                                szczegółyFilm(memoryFilm[i]);
                            }
                        }
                        userInputSzukanieOcena();
                    }
                    else err = true; //Xnowe4
                    break;
            }
            break;
        case 1 :
            if (arg.length == 3) {
                o1 = arg[0];
                o2 = arg[2];
                if ((isNaN(o1) == false) && (isNaN(o2) == false)) {
                    console.clear();
                    obrazMenuSzukanieOcena();
                    szukaneZnalezione = [];
                    szukajOcen(o1,o2);
                    userInputSzukanieOcena();
                    }
                else err = true;
                }
            else if (arg.length == 4) {
                o1 = arg[0];
                o2 = arg[2]+arg[3];
                if ((isNaN(o1) == false) && (isNaN(o2) == false) && (o2 <= 10)) {
                    console.clear();
                    obrazMenuSzukanieOcena();
                    szukaneZnalezione = [];
                    szukajOcen(o1,o2);
                    userInputSzukanieOcena();
                }
                else err = true;
            }
            else err = true;
            break;
        case 2 :
            o1 = arg[0]+arg[1];
            o2 = arg[3];
            if (o1 == '10') {
                o1 = 10;
            }
            if ((isNaN(o1) == false) && (isNaN(o2) == false) && (o1 <= 10)) {
                console.clear();
                obrazMenuSzukanieOcena();
                szukaneZnalezione = [];
                szukajOcen(o1,o2);
                userInputSzukanieOcena();
            }
            else err = true;
            break;            
        default :
            err = true;
            break;
    }
    if (err == true) {
        console.log('Błędne polecenie. Wpisz "HELP" aby uzyskać pomoc.');
        userInputSzukanieOcena();
    }
}
function menuSzukanieGatunek(arg) { // MENU SZUKANIA PO GATUNKU (3,3)
    switch (arg) {
        case 'm' :
        case 'menu' :
        case '' :
            console.clear();
            obrazMenuGłówne();
            userInput();
            break;
        case 'edycja' :
            if (zezwolenie() == true) {
                newData = data;
                menuInfo = 33;
                console.clear();
                obrazMenuSzukanieGatunek();
                odstęp();
                obrazEdycja(wybranyFilm);
                userInputEdycja();
            }
            userInputSzukanieGatunek();
            break;           
        case 'exit' :
            console.clear();
            wyjście();
            break;
        case 'h' :
        case 'help' :
            console.clear();
            obrazMenuSzukanieGatunek();
            pomocSzukanieGatunek();
            userInputSzukanieGatunek();
            break;
        case 'g' :
        case 'gatunek' :
            console.clear();
            obrazMenuSzukanieGatunek();
            gatunkiInfo();
            userInputSzukanieGatunek();
            break;
        case 's' :
        case 'szukaj' :
            console.clear();
            obrazMenuSzukanie();
            userInputSzukanie();
            break;
        case 'filmy':
        case 'f' :
        case 'w' :
            console.clear();
            obrazMenuFilmy();
            tytuły();
            userInputFilmy();
            break;
        case '-' :
        case 'u' :
            if (zezwolenie() == true) {
                usuńFilm(memoryFilm[0]);
            }
            else console.log('Wybierz tylko jeden film!');
            userInputSzukanieGatunek();
            break;
            break;
        case 'nowe' :
        case 'n' :
            console.clear();
            obrazMenuNoweFilmy();
            noweFilmy();
            userInputNoweFilmy();
            break;
        default :
            let uruchom = false; // uruchomienie szukania
            gatunki();
            for (i=0; i<gatunek.length; i++) {
                if (arg == gatunek[i]) {
                    uruchom = true;
                }
            }
            if (uruchom == true) {
                console.clear();
                obrazMenuSzukanieGatunek();
                gatunkiInfo();
                szukaneZnalezione = [];
                szukajGatunek(arg);
                userInputSzukanieGatunek();
            }
            else {
                if (szukaneZnalezione.length != 0) {
                    szukanieTytułówWybranych(arg);

                    if (memoryFilm.length == 0 ) {
                        console.log('Błędna komenda. Wpisz "help" aby uzyskać pomoc...\n');
                        userInputSzukanieGatunek();
                    }
                    else
                    {
                        console.clear();
                        obrazMenuSzukanieGatunek();
                        for (i=0; i<memoryFilm.length; i++) {
                            szczegółyFilm(memoryFilm[i]);
                        }
                    }
                
                    userInputSzukanieGatunek();
                }
                else{
                    console.log('Błędne polecenie. Wpisz "HELP" aby uzyskać pomoc.');
                    userInputSzukanieGatunek();
                }
            }
        break;
        }
}
function menuSzukanieDowolne(arg) { // MENU SZUKANIA DOWOLNEGO (3,4)
    switch(arg) {
        case 'help' :
            console.clear();
            obrazMenuSzukanieDowolne();
            pomocSzukanieDowolne();
            userInputSzukanieDowolne();
            break;
        case 'menu' :
        case '' :
            console.clear();
            obrazMenuGłówne();
            userInput();
            break;
        case 'exit' :
            console.clear();
            wyjście();
            break;
        case 'edycja' :
            if (zezwolenie() == true) {
                newData = data;
                menuInfo = 34;
                console.clear();
                obrazMenuSzukanieDowolne();
                odstęp();
                obrazEdycja(wybranyFilm);
                userInputEdycja();
            }
            userInputSzukanieDowolne();
            break;
        case '-' :
            if (zezwolenie() == true) {
                usuńFilm(memoryFilm[0]);
            }
            else console.log('Wybierz tylko jeden film!');
                userInputSzukanieDowolne();
            break;
            break;
        case 'szukaj' :
            console.clear();
            obrazMenuSzukanie();
            userInputSzukanie();
            break;
        default :
            szukanieDowolne(arg);
            userInputSzukanieDowolne();
            break;
    }
}
function menuEdycja(arg) { // MENU EDYCJI (E)

    console.clear();
    switch(menuInfo) {
        case 0 :
            obrazMenuGłówne();
            break;
        case 1 :
            obrazMenuSzczegółyFilm();
            break;
        case 2 :
            obrazMenuSzczegółyNoweFilmy();
            break;
        case 31 :
            obrazMenuSzukanieLitera();
            break;
        case 32 :
            obrazMenuSzukanieOcena();
            break;
        case 33 :
            obrazMenuSzukanieGatunek();
            break;
        case 33 :
            obrazMenuSzukanieDowolne();
            break;
        default :
            obrazMenuGłówne();
            break;
    }
    odstęp();
    obrazEdycja(wybranyFilm);

    switch(arg) {
        case '' :
            console.clear();
            if (menuInfo == 0) {
                if (data[wybranyFilm].Stars == '') {
                    obrazMenuSzczegółyNoweFilmy();
                    szczegółyFilm(memoryFilm[0]);
                    console.log('\nFilm zapisany.');
                    userInputSzczegółyNoweFilmy();
                }
                else {
                    obrazMenuSzczegółyFilm();
                    szczegółyFilm(memoryFilm[0]);
                    console.log('\nFilm zapisany.');
                    userInputSzczegółyFilm();
                }
            }
            if (menuInfo == 1) {
                obrazMenuSzczegółyFilm();
                szczegółyFilm(memoryFilm[0]);
                console.log('\nFilm zapisany.');
                userInputSzczegółyFilm();
            }
            if (menuInfo == 2) {
                obrazMenuSzczegółyNoweFilmy();
                szczegółyFilm(memoryFilm[0]);
                console.log('\nFilm zapisany.');
                userInputSzczegółyNoweFilmy();
            }
            if (menuInfo == 31) {
                obrazMenuSzukanieLitera();
                szczegółyFilm(memoryFilm[0]);
                console.log('\nFilm zapisany.');
                userInputSzukanieLitera();
            }
            if (menuInfo == 32) {
                obrazMenuSzukanieOcena();
                szczegółyFilm(memoryFilm[0]);
                console.log('\nFilm zapisany.');
                userInputSzukanieOcena();
            }
            if (menuInfo == 33) {
                obrazMenuSzukanieGatunek();
                szczegółyFilm(memoryFilm[0]);
                console.log('\nFilm zapisany.');
                userInputSzukanieGatunek();
            }
            if (menuInfo == 34) {
                obrazMenuSzukanieDowolne();
                szczegółyFilm(memoryFilm[0]);
                console.log('\nFilm zapisany.');
                userInputSzukanieDowolne();
            }
            break;
        case '1' :
        case 'tytuł' :
            nrPola = 1;
            pytanieP = 'Nowy tytuł filmu: ';
            userInputEdycjaPole();
            break;
        case '2' :
        case 'ocena' :
            nrPola = 2;
            pytanieP = 'Nowa ocena: ';
            userInputEdycjaPole();
            break;
        case '3' :
        case 'opis' :
            nrPola = 3;
            pytanieP = 'Nowy opis: ';
            userInputEdycjaPole();
        break;
        case '4' :
        case 'gatunek' :
            nrPola = 4;
            gatunkiInfo();
            pytanieP = 'Nowy gatunek: ';
            userInputEdycjaPole();
            break;
        case '5' :
        case 'reżyser' :
            nrPola = 5;
            pytanieP = 'Nowy reżyser: ';
            userInputEdycjaPole();
            break;
        case '6' :
        case 'aktorzy' :
            nrPola = 6;
            pytanieP = 'Nowi aktorzy: ';
            userInputEdycjaPole();
            break;
            case 'menu' :
            case 'm' :
                console.clear();
                obrazMenuGłówne();
                userInput();
                break;
            case 'nowe' :
            case 'n' :    
                console.clear();
                obrazMenuNoweFilmy();
                noweFilmy();
                userInputNoweFilmy();
                break;
            case 'w' :
            case 'filmy':
            case 'f' :
                console.clear();
                obrazMenuFilmy();
                tytuły();
                userInputFilmy();
                break;
            case 'szukaj' :
            case 's' :
                console.clear();
                obrazMenuSzukanie();
                userInputSzukanie();
                break;
            case 'h' :
            case 'help' :
                console.clear();
                switch(menuInfo) {
                    case 0 :
                        obrazMenuGłówne();
                        break;
                    case 1 :
                        obrazMenuSzczegółyFilm();
                        break;
                    case 2 :
                        obrazMenuSzczegółyNoweFilmy();
                        break;
                    }
                    odstęp();
                    obrazEdycja(wybranyFilm);
                    pomocEdycja()
                    userInputEdycja();
                break;
        default :
            console.log('Błędne polecenie, wpisz HELP, aby uzyskać pomoc.');
            userInputEdycja();
    }
}
//-------------- M. GŁÓWNE FUNKCJE --------------- 
function tytuły() { // FILMY TYTUŁY (1)
    menuInfo = 1;
    let tytuł;
    let film = filmPL(data.length);

    if (data.length != 0) {
        odstęp();
        console.log(`Znaleziono ${data.length} ${film}:\n`);
       for (i=0; i<data.length; i++) { // wypisze tytuły filmów
            tytuł = data[i].Title;
            console.log(`${tytuł}`);
        }
        odstępMały();
    }
    else {
        console.log(colors.red('W bazie nie znaleziono filmów!\nSprawdź plik "baza filmów.xlsx".'));
    }

}
function noweFilmy() { // FILMY BEZ OCEN (2)
    menuInfo = 2;
    let j = 0;
    odstęp();
    let znalezioneF = [];
    ileNowychFilmów = 0;

    for (i=0; i<data.length; i++) { // wypisze tytuły filmów bez ocen
        if  ((data[i].Stars == null) || (data[i].Stars == '')) {
            znalezioneF.push(i);
        }
    }

    let film = filmPL(znalezioneF.length);
    let nowy = nowyPL(znalezioneF.length);

    if (znalezioneF.length == 0) 
        console.log('Brak nowych filmów!');
    else {
        console.log(`Znaleziono ${znalezioneF.length} ${nowy} ${film}:\n`);
        for (i=0; i<znalezioneF.length; i++) {
            let tytuł = data[znalezioneF[i]].Title;
            console.log(`${tytuł}`);
        }
    }
    odstępMały();

    if (znalezioneF.length == 1) {
        memoryFilm = [znalezioneF[0]];
    }

    return ileNowychFilmów = znalezioneF.length;
}

//------------ M. FILMÓW FUNKCJE -----------------
function szczegóły() { // SZCZEGÓŁY WSZYSTKICH FILMÓW (1,1) ----------------- upgrade pomocy
    szczegółyInfo = 2;
    menuInfo = 1;
    wyświetlSzczegóły = true;

    console.clear();
    obrazMenuSzczegółyFilm();
    odstęp();

    // ilość filmów dziele i wyświetlam po 4. info która strona z max
    if (next == true) {
        console.log(`Strona ${strona} z ${stronaMax}\n`);

        for (i=wskaźnik-4; i<wskaźnik; i++) {
            if (i < data.length) {
                let tytuł   = data[i].Title;
                if (tytuł == undefined) {tytuł = ''};
                let ocena   = data[i].Stars;
                if (ocena == undefined) {ocena = ''};
                let opis    = data[i].Description;
                if (opis == undefined) {opis = ''};
                let gatunek = data[i].Type;
                if (gatunek == undefined) {gatunek = ''};
                let reżyser = data[i].Director;
                if (reżyser == undefined) {reżyser = ''};
                let aktorzy = data[i].Actors;
                if (aktorzy == undefined) {aktorzy = ''};

                console.log(`${tytuł}:
                ocena   - ${ocena}
                opis    - ${opis}
                gatunek - ${gatunek}
                reżyser - ${reżyser}
                aktorzy - ${aktorzy}
                `);
            } 
        }
    }
    next = false;
    wskaźnik += 4; // następne cztery filmy
    strona ++;
    if (strona > stronaMax+1) {
        console.clear();
        obrazMenuFilmy();
        tytuły();
        userInputFilmy();
        wyświetlSzczegóły = false;
    }
    userInputSzczegółyFilm();
}
function szczegółyFilm(i) { // SZCZEGÓŁY JEDNEGO FILMU (1,2) i (2,2)
    szczegółyInfo = 1;
    let ocena = '';
    let czyNowy = false;
    //memoryFilm = []; //Xnowe

    if (data[i].Stars == undefined) {
        czyNowy = true;
    }
    else {
        ocena = data[i].Stars;}

    let opis    = data[i].Description;
    if (opis == undefined) {opis = '';}
    let gatunek = data[i].Type;
    if (gatunek == undefined) {gatunek = '';}
    let reżyser = data[i].Director;
    if (reżyser == undefined) {reżyser = '';}
    let aktorzy = data[i].Actors;
    if (aktorzy == undefined) {aktorzy = '';}

    odstęp();
    console.log(`Szczegółowe informacje o filmie "${data[i].Title}" :
    ocena   - ${ocena}
    opis    - ${opis}
    gatunek - ${gatunek}
    reżyser - ${reżyser}
    aktorzy - ${aktorzy}`);
}
function szukanieTytułów(arg) { // SZUKANIE TYTUŁÓW WSZYSTKICH FILMÓW
    //skasuj tablicę z filmami, jeżeli poprzednio już wyświetliło wszystkie i nie był to 1 film
    let tytuł;
    let pierwszeSzukanie = true;
    filmWBazie = false;
    //if (memoryFilm.length == 2) {
    //    if (memoryFilm[0] == memoryFilm [1]) memoryFilm = []; //Xnowe3
    //}
    if (memoryFilm.length != 1) memoryFilm = []; //Xnowe3
    //    if (nieKasujMemoryFilm == false) memoryFilm = [];

    if (wyświetlSzczegóły == true) memoryFilm = [];
    for (i=0; i<data.length; i++) {
        tytuł = data[i].Title.toLocaleLowerCase().substring(0,arg.length);
        if (arg == tytuł) {
            if (pierwszeSzukanie == true) memoryFilm = [];
            //pozwolenie na skasowanie tablicy przy 1wszym szukaniu //Xnowe4
            memoryFilm.push(i);
            pierwszeSzukanie = false;
            filmWBazie = true;
        }
    }
    return filmWBazie; // Xnowe
}
function szukanieTytułówNowych(arg) { // SZUKANIE TYTUŁÓW NOWYCH FILMÓW
    let tytuł;
    let znalezioneN = [];
    let znalezioneF = [];
    let pierwszeSzukanie = true;

    filmWBazie = false;
    //if (memoryFilm.length == 2) {
    //    if (memoryFilm[0] == memoryFilm [1]) memoryFilm = []; //Xnowe3
    //}
    if (memoryFilm.length != 1) memoryFilm = []; //Xnowe3
    //if (nieKasujMemoryFilm == false) memoryFilm = [];
    if (wyświetlSzczegóły == true) memoryFilm = [];
    for (i=0; i<data.length; i++) { // wypisze tytuły filmów bez ocen
        tytuł = data[i].Title.toLocaleLowerCase().substring(0,arg.length);
        if ((data[i].Stars == null) || (data[i].Stars == '')) {
            znalezioneN.push(i);
        }
        if (arg == tytuł) {
            znalezioneF.push(i);
        }
    }
    for (i=0; i<znalezioneN.length; i++) {
        for (j=0; j<znalezioneF.length; j++) {
            if (znalezioneN[i] == znalezioneF[j]) {
                if (pierwszeSzukanie == true) memoryFilm = [];
                memoryFilm.push(znalezioneF[j]);
                filmWBazie = true;
                pierwszeSzukanie = false;
            }
        }
    }
    return filmWBazie; // Xnowe
}

//----------- M. NOWYCH FILMÓW FUNKCJE -----------
function szczegółyNoweFilmy() { // SZCZEGÓŁY NOWYCH FILMÓW (2,1) -------- najpierw znalezienie filmów, póżniej podział i wypisanie
    szczegółyInfo = 2;
    wyświetlSzczegóły = true;
    let znalezioneF = [];
    let ocena = '';

    for (i=0; i<data.length; i++){  // znalezienie filmów.
        if ((data[i].Stars == undefined) || (data[i].Stars == '')){
            znalezioneF.push(i);
        }
    }
    console.clear();
    obrazMenuSzczegółyNoweFilmy();
    odstęp();
    // ilość filmów dziele i wyświetlam po 4. info która strona z max
    if ((znalezioneF.length != 0) && (next == true)) {
        console.log(`Strona ${strona} z ${stronaMax}\n`);
        for (i=wskaźnik-4; i<wskaźnik; i++) {
            if (i < data.length) {
                if (znalezioneF[i] != undefined) {
                let opis = data[znalezioneF[i]].Description;
                if (opis == undefined) {opis = ''};
                let gatunek = data[znalezioneF[i]].Type;
                if (gatunek == undefined) {gatunek = ''};
                let reżyser = data[znalezioneF[i]].Director;
                if (reżyser == undefined) {reżyser = ''};
                let aktorzy = data[znalezioneF[i]].Actors;
                if (aktorzy == undefined) {aktorzy = ''};

                console.log(`Szczegółowe informacje o filmie "${data[znalezioneF[i]].Title}" :
                ocena   - ${ocena}
                opis    - ${opis}
                gatunek - ${gatunek}
                reżyser - ${reżyser}
                aktorzy - ${aktorzy}
                `);
                }
            }
        }
    }
    if (znalezioneF.length == 0) {
        odstęp();
        console.log('Nie znaleziono nowych filmów.');
        odstęp();
    }

    next = false;
    wskaźnik += 4; // następne cztery filmy
    strona ++;
    if (strona > stronaMax+1) {
        wyświetlSzczegóły = false;
        console.clear();
        obrazMenuNoweFilmy();
        noweFilmy();
        userInputNoweFilmy();
    }
    memoryFilm = znalezioneF; // Xnowe
    userInputSzczegółyNoweFilmy();
}  
function oceń(arg) {
    let err2 = false;
    newData = data;

    if (isNaN(arg) == false) {
        if (arg < 0 ) {
            arg = '0';
            err2 = true;
        }
        if (arg > 10) {
            arg = '10';
            err2 = true;
        }
        newData[wybranyFilm].Stars = arg;
        zapis(newData);
        console.clear();
        obrazMenuSzczegółyNoweFilmy();
        szczegółyFilm(memoryFilm[0]);
    }
    else {
        console.log(colors.red('Ocena musi być liczbą!\n'));
    }
    if (err2 == true) {
        console.log(colors.red('Zakres ocen 0 - 10\n'));
    }
    userInputSzczegółyNoweFilmy();
}

//--------------- M. SZUKANIE ---------------------
function szukaj(arg) { // SZUKANIE PO LITERZE
    
    function poszukiwanaLitera(argL) { // F. POMOCNICZA SZUKANIA
        let pierwszaLitera; // pierwsza litera filmu
        let znalezioneF = [] // tablica zawiera numery znalezionych filmów
        let film; // odmiana słowa
        for (i=0; i<data.length; i++) {
            pierwszaLitera = (data[i].Title)[0].toLocaleLowerCase();
            if (argL == pierwszaLitera) {
            znalezioneF.push(i);
            szukaneZnalezione.push(i);
            }
        }
        film = filmPL(znalezioneF.length);

        if (znalezioneF.length > 0) {
            odstęp();
            console.log(`Znaleziono ${znalezioneF.length} ${film} na "${argL.toUpperCase()}" :\n`);
            for (i=0 ; i<znalezioneF.length; i++) {
                console.log('- ',data[znalezioneF[i]].Title);
            }
            odstęp();
        }
        else {
            odstęp();
            console.log(`W bazie nie znaleziono filmów na "${argL.toUpperCase()}"`);
            odstęp();
        }
        return szukaneZnalezione;
    }
    function poszukiwanaLiteraPokrewna(argL) { // F. POMOCNICZA SZUKANIA POKREWNYCH LITER
        let pierwszaLitera; // pierwsza litera filmu
        let znalezioneF = [] // tablica zawiera numery znalezionych filmów
        let film; // odmiana słowa
        for (i=0; i<data.length; i++) {
            pierwszaLitera = (data[i].Title)[0].toLocaleLowerCase();
            if (argL == pierwszaLitera) {
            znalezioneF.push(i);
            szukaneZnalezione.push(i);
            }
        }
        film = filmPL(znalezioneF.length);
            
        if (znalezioneF.length != 0) {
            console.log(`Znaleziono ${znalezioneF.length} ${film} na "${argL.toUpperCase()}" :\n`);
            for (i=0 ; i<znalezioneF.length; i++) {
                console.log('- ',data[znalezioneF[i]].Title);
            }
            odstęp();
        }
        return szukaneZnalezione;
    }
    switch (arg) {
        case 'z' :
            poszukiwanaLitera('z');
            poszukiwanaLiteraPokrewna('ź');
            poszukiwanaLiteraPokrewna('ż');
            break;
        case 's' :
            poszukiwanaLitera('s');
            poszukiwanaLiteraPokrewna('ś');
            break;
        case 'c' :
            poszukiwanaLitera('c');
            poszukiwanaLiteraPokrewna('ć');
            break;
        case 'o' :
            poszukiwanaLitera('o');
            poszukiwanaLiteraPokrewna('ó');
            break;
        case 'l' :
            poszukiwanaLitera('l');
            poszukiwanaLiteraPokrewna('ł');
            break;
        case 'ń' :
            console.log('\nń kurwa?\n');
            poszukiwanaLitera('ń');
            break;
        default :
        poszukiwanaLitera(arg);
            break;
    }
    return szukaneZnalezione
}
function szukajOcena(o) { // SZUKANIE PO OCENIE
    let znalezioneF= []; // zawiera numery znalezionych filmów
    let film; // odmiana słowa
    for (i=0; i<data.length; i++) {
        if (data[i].Stars == o) {
            znalezioneF.push(i);
        }
    }
    film = filmPL(znalezioneF.length);

    if (znalezioneF.length != 0) {
        odstęp();
        console.log(`\nZnaleziono ${znalezioneF.length} ${film} na ocenę "${o}" :\n`);
        for (i=0 ; i<znalezioneF.length; i++) {
            console.log('- ',data[znalezioneF[i]].Title);
        }
        odstęp();
    }
    else {
        odstęp();
        console.log(`\nNie znaleziono filmów na ocenę ${o} .`);
        odstęp();
    }
    return szukaneZnalezione = znalezioneF;
}
function szukajOcen(o1,o2) { // SZUKANIE PO ZAKRESIE OCEN
    let znalezioneF = [];
    let film;

    if (isNaN(o1) == false) o1 = Number(o1);
    if (isNaN(o2) == false) o2 = Number(o2);
    if (o1 < o2) {
        for (i=0; i<data.length; i++) {
            if ((data[i].Stars != undefined) && (data[i].Stars != '')) {
                if ((data[i].Stars >= o1) && (data[i].Stars <= o2))
                znalezioneF.push(i);
            }
        }
    }
    if (o1 > o2) {
        for (i=0; i<data.length; i++) {
            if ((data[i].Stars != undefined) && (data[i].Stars != '')) {
                if ((data[i].Stars >= o2) && (data[i].Stars <= o1))
                znalezioneF.push(i);
            }
        }
    }
    if ((o1 == o2) && (isNaN(o1) == false)) {
        szukajOcena(o1);
    }
    film = filmPL(znalezioneF.length);

    if (o1 != o2) {
        if (znalezioneF.length != 0) {
            odstęp();
            console.log(`\nZnaleziono ${znalezioneF.length} ${film} w zakresie ocen ${o1} - ${o2} :\n`);
            for (i=0 ; i<znalezioneF.length; i++) {
                console.log('- ',data[znalezioneF[i]].Title,';  ocena: ',data[znalezioneF[i]].Stars);
            }
            odstęp();
        }
        else {
            odstęp();
            console.log(`\nNie znaleziono filmów w zakresie ocen ${o1} - ${o2} .`);
            odstęp();
        }
    }
    return szukaneZnalezione = znalezioneF;
}
function szukajGatunek(arg) { // SZUKANIE PO GATUNKU FILMU /// szukanie jeśli nie ma gatunku
    let znalezioneF = [];
    odstęp();
    if (gatunek.length != 0) {
        for (i=0; i<data.length; i++) {
            if (data[i].Type == arg) {
                znalezioneF.push(i);
            }
        }
        if (znalezioneF.length == 0) {
            console.log(`W bazie nie ma filmów spełniających podane kryteria.`);
        }
        if (znalezioneF.length != 0) {
            let film = filmPL(znalezioneF.length);
            console.log(`Znaleziono ${znalezioneF.length} ${film}, gatunek ${arg}:\n`);
            for (i=0; i<znalezioneF.length; i++) {
                console.log('- ',data[znalezioneF[i]].Title);
            }
        }
    }

    if (gatunek.length == 0) {
        console.log(`W bazie nie ma żadnych gatunków filmów.`);
    }
    odstęp();
    //jeśli gatunek odpowiada filmowi, to wypisz
    return szukaneZnalezione = znalezioneF;
}
function szukanieTytułówWybranych(arg) { // SZUKANIE TYTUŁÓW PO WYSZUKANIU
    let tytuł;
    memoryFilm = [];
    let znalezioneF = [];
    for (i=0; i<szukaneZnalezione.length; i++) { // wypisze tytuły filmów bez ocen
        tytuł = data[szukaneZnalezione[i]].Title.toLocaleLowerCase().substring(0,arg.length);
        if (arg == tytuł) {
            memoryFilm.push(szukaneZnalezione[i]);
        }
    }
}
function szukanieDowolne(arg) {
    let znalezioneF = [];
    let szukany; // indeks od którego zaczyna się szukany ciąg znaków

   for (i=0; i<data.length; i++) {
       tytuł = data[i].Title.toLocaleLowerCase();
       szukany = tytuł.search(arg);
       if (szukany != -1) { // jeśli znalazł arg, to dodaje indeks filmu do tablicy
           znalezioneF.push(i);
       }
    }

    console.clear();
    obrazMenuSzukanieDowolne();
    odstęp();

    if (znalezioneF.length == 0) {
        console.log(`W bazie nie ma filmów spełniających podane kryteria.`);
    }
    if (znalezioneF.length != 0) {
        let film = filmPL(znalezioneF.length);
        console.log(`Znaleziono ${znalezioneF.length} ${film} zawierające ${arg} w tytule:\n`);
        for (i=0; i<znalezioneF.length; i++) {
            console.log('- ',data[znalezioneF[i]].Title);
        }
    }
    if (znalezioneF.length == 1) {
        szczegółyFilm(znalezioneF[0]);
    }
}
// ---------------- OBRAZY -----------------------
function obrazMenuGłówne() { // M.GŁÓWNE OBRAZ (0)
    console.log(colors.yellow('   *** MENU GŁÓWNE ***')); // '\x1b[33m%s\x1b[0m'
    console.log(`
    (W) WSZYSTKIE FILMY
    (N) NOWE FILMY
    (S) SZUKAJ`);
}
function obrazMenuFilmy() { // M.FILMY OBRAZ (1)
    console.clear();
    console.log('   *** MENU GŁÓWNE ***\n');
    console.log(colors.yellow('    (W) WSZYSTKIE FILMY'));
    console.log(`          (1) SZCZEGÓŁY
    (N) NOWE FILMY
    (S) SZUKAJ`);
}
function obrazMenuSzczegółyFilm() { // M.SZCZEGÓŁY FILMÓW OBRAZ (1,1)
    console.clear();
    console.log('   *** MENU GŁÓWNE ***\n');
    console.log('    (W) WSZYSTKIE FILMY');
    console.log(colors.yellow('          (1) SZCZEGÓŁY'));
    console.log(`    (N) NOWE FILMY
    (S) SZUKAJ FILMU`);
}
function obrazMenuNoweFilmy() { // M.NOWE FILMY OBRAZ (2)
    console.clear();
    console.log(`   *** MENU GŁÓWNE ***\n
    (W) WSZYSTKIE FILMY`);
        console.log(colors.yellow('    (N) NOWE FILMY'));
        console.log(`          (1) SZCZEGÓŁY
          (2) OCEŃ
    (S) SZUKAJ FILMU`);
}
function obrazMenuSzczegółyNoweFilmy() { // SZCZEGÓŁY NOWYCH FILMÓW (2,1)
    console.log(`   *** MENU GŁÓWNE ***

    (W) WSZYSTKIE FILMY
    (N) NOWE FILMY`);
    console.log(colors.yellow('          (1) SZCZEGÓŁY'));
    console.log(`          (2) OCEŃ
    (S) SZUKAJ FILMU`);
}
function obrazOceń() { // OBRAZ OCEŃ (2,2)
    console.log(`   *** MENU GŁÓWNE ***

    (W) WSZYSTKIE FILMY
    (N) NOWE FILMY
              (1) SZCZEGÓŁY`);
    console.log(colors.yellow('        (2) OCEŃ'));
    console.log('    (S) SZUKAJ FILMU');
}
function obrazMenuSzukanie() { // M. SZUKANIE OBRAZ (3)
    console.log(`   *** MENU GŁÓWNE ***

    (W) WSZYSTKIE FILMY
    (N) NOWE FILMY`);
    console.log(colors.yellow('    (S) SZUKAJ FILMU'));
    console.log(`          (1) PO LITERZE
          (2) PO OCENIE
          (3) PO GATUNKU
          (4) DOWOLNE`);
}
function obrazMenuSzukanieLitera() { // M.. SZUKANIE PO LITERZE (3,1)
    console.log(`   *** MENU GŁÓWNE ***

    (W) WSZYSTKIE FILMY
    (N) NOWE FILMY
    (S) SZUKAJ FILMU`);
    console.log(colors.yellow('          (1) PO LITERZE'));
    console.log(`          (2) PO OCENIE
          (3) PO GATUNKU
          (4) DOWOLNE`);
}
function obrazMenuSzukanieOcena() { // M.. SZUKANIE PO OCENIE (3,2)
    console.log(`   *** MENU GŁÓWNE ***

    (W) WSZYSTKIE FILMY
    (N) NOWE FILMY
    (S) SZUKAJ FILMU
          (1) PO LITERZE`);
    console.log(colors.yellow('          (2) PO OCENIE'));
    console.log(`          (3) PO GATUNKU
          (4) DOWOLNE`);
}
function obrazMenuSzukanieGatunek() { // M. SZUKANIE PO GATUNKU (3,3)
    console.log(`   *** MENU GŁÓWNE ***

    (W) WSZYSTKIE FILMY
    (N) NOWE FILMY
    (S) SZUKAJ FILMU
          (1) PO LITERZE
          (2) PO OCENIE`);
    console.log(colors.yellow('          (3) PO GATUNKU'));
    console.log('          (4) DOWOLNE')
}
function obrazEdycja(nr) {  // OBRAZ EDYCJI FILMU (E)
    console.log (`EDYCJA FILMU:

    (1) - tytuł     - ${newData[nr].Title}
    (2) - ocena     - ${newData[nr].Stars}
    (3) - opis      - ${newData[nr].Description}
    (4) - gatunek   - ${newData[nr].Type}
    (5) - reżyser   - ${newData[nr].Director}
    (6) - aktorzy   - ${newData[nr].Actors}
    `)
}
function obrazMenuSzukanieDowolne() {
    console.log(`   *** MENU GŁÓWNE ***

    (W) WSZYSTKIE FILMY
    (N) NOWE FILMY
    (S) SZUKAJ FILMU
          (1) PO LITERZE
          (2) PO OCENIE
          (3) PO GATUNKU`);
    console.log(colors.yellow('          (4) DOWOLNE'));
}

//---------------- POMOC -------------------------
function pomoc() { // - M.GŁÓWNE - POMOC (0)
    console.log('\x1b[32m%s\x1b[0m',`
    KOMENDY W MENU GŁÓWNYM:

    W / FILMY   - wyświetla wszystkie filmy
    N / NOWE    - Wyświetla filmy bez oceny
    S / SZUKAJ  - wyszukuje filmy

    D / DODAJ   - dodaj film
 
    I / INFO    - informacje o programie i autorze
    E / EXIT    - wyjście z programu

    -----------------------------------------------------------------------------------------

    EDYCJA i USUWANIE dostępne z menu (1) FILMÓW i (2) NOWYCH FILMÓW.

    Z KAŻDEGO MIEJSCA W PROGRAMIE MOŻNA WPISAĆ POLECENIE 'HELP'.
    
    `);
}
function pomocFilmy() { // M.FILMY POMOC (1)
    console.log('\x1b[32m%s\x1b[0m',`
    KOMENDY W MENU FILMÓW:

    1 / SZCZEGÓŁY       - szczegóły filmów

    (tytuł filmu)       - wpisz tytuł filmu zaczynając od początku tytułu, aby uzyskać o nim informacje.
                          usuwanie, edycja i ocenianie dostępne po wybraniu szczegółów (tytuł filmu)
            - / U       - usuń znaleziony film
            USUŃ        - usuń wyszystkie znalezione filmy
            2 / OCENA   - oceń film (dostępne z menu (N) NOWYCH FILMÓW)
                          
    D / DODAJ           - dodaj film
   
    M / MENU            - menu główne
    W / FILMY           - menu wszystkich filmów
    N / NOWE            - menu nowych filmów
    S / SZUKAJ          - menu szukania filmu
    E / EXIT            - wyjście z programu
    `);
}
function pomocSzczegółyFilm() { // SZCZEGÓŁY FILMU POMOC
    console.log(colors.green(`
    Zawiera wszystkie dostępne informacje o filmach.

    KOMENDY W MENU SZCZEGÓŁÓW FILMU:

    'ENTER'             - następna strona
    (tytuł filmu)       - wpisz tytuł filmu zaczynając od początku tytułu, aby uzyskać o nim informacje.
    2 / OCENA           - oceń film (dostępne po wybraniu tylko jednego filmu)
    EDYCJA          - edytuj informacje o filmie (dostępne po wybraniu tylko jednego filmu)
    - / U               - usuń film (dostępne po wybraniu tylko jednego filmu)
    USUŃ                - usuń wszystkie wybrane filmy

    M / MENU            - menu główne
    W / FILMY           - menu wszystkich filmów
    N / NOWE            - menu nowych filmów
    S / SZUKAJ          - menu szukania filmu
    E / EXIT            - wyjście z programu
    `));
}
function pomocSzukanie() { // M. POMOCY SZUKANIA (3)
    console.log(colors.green(`
    KOMENDY W MENU SZUKANIA:

    1 / LITERA          - szukaj filmu po pierwszej literze tytułu
    2 / OCENA           - szukaj filmu po zakresie ocen
    3 / GATUNEK         - szukaj filmu po gatunku
    4 / DOWOLNE         - szukaj filmu po dowolnej frazie z tytułu

    M / MENU            - menu główne
    W / FILMY           - menu wszystkich filmów
    N / NOWE            - menu nowych filmów
    S / SZUKAJ          - menu szukania filmu
    E / EXIT            - wyjście z programu
    `));
}
function pomocSzukanieLitera() { // M. SZUKANIA PO LITERZE (3,1)
    console.log(colors.green(`
    Można wyszukać filmy po pierwszej literze / cyfrze tytułu:
    - wprowadź szukany znak. np: S (wyszuka filmy zaczynające się na "S" oraz "Ś")

    KOMENDY W MENU SZUKANIA PO LITERZE:

    (tytuł filmu)       - wpisz tytuł filmu zaczynając od początku tytułu, aby uzyskać o nim informacje.
    EDYCJA              - edytuj informacje o filmie (dostępne po wybraniu tylko jednego filmu)
    '-'                 - usuń znaleziony film
    SZUKAJ              - menu szukania filmu
    'ENTER' / MENU      - menu główne
    EXIT                - wyjście z programu
    `))
}
function pomocSzukanieOcena() { // M. POMOCY SZUKANIA PO OCENIE (3,2)
    console.log(colors.green(`
    Można wyszukać filmy po ocenie na dwa sposoby:
    - wprowadzić szukaną ocenę. np: 7 (wyszuka filmy z oceną 7)
    - wprowadzić zakres ocen. np: 4-7 (wyszuka filmy z ocenami 4,5,6 i 7)
            ważne, aby oceny oddzielał znak "-".

    KOMENDY W MENU SZUKANIA PO OCENIE:

    (tytuł filmu)       - wpisz tytuł filmu zaczynając od początku tytułu, aby uzyskać o nim informacje.
    EDYCJA              - edytuj informacje o filmie (dostępne po wybraniu tylko jednego filmu)
    - / U               - usuń znaleziony film
    S / SZUKAJ          - menu szukania filmu
    'ENTER' / MENU      - menu główne
    E / EXIT            - wyjście z programu
    `));
}
function pomocSzukanieGatunek() { // M. POMOCY SZUKANIA PO GATUNKU (3,3)
    console.log(colors.green(`
    Można wyszukać filmy po ocenie na dwa sposoby:
    - wprowadzić szukaną ocenę. np: 7 (wyszuka filmy z oceną 7)
    - wprowadzić zakres ocen. np: 4-7 (wyszuka filmy z ocenami 4,5,6 i 7)
            ważne, aby oceny oddzielał znak "-".

    KOMENDY W MENU SZUKANIA PO GATUNKU:
    
    (tytuł filmu)       - wpisz tytuł filmu zaczynając od początku tytułu, aby uzyskać o nim informacje.
    EDYCJA              - edytuj informacje o filmie (dostępne po wybraniu tylko jednego filmu)
    - / U               - usuń znaleziony film
    S / SZUKAJ          - menu szukania filmu
    'ENTER' / MENU      - menu główne
    E / EXIT            - wyjście z programu
    `));
}
function pomocSzukanieDowolne() { // M. POMOCY SZUKANIA DOWOLNEGO (3,4)
    console.log(colors.green(`
    Można wyszukać filmy po dowolnej frazie z tytułu filmu.
    - wprowadź kawałek szukanego tutułu.

    KOMENDY W MENU SZUKANIA DOWOLNEGO:

    (tytuł filmu)       - wpisz tytuł filmu zaczynając od początku tytułu, aby uzyskać o nim informacje.
    EDYCJA              - edytuj informacje o filmie (dostępne po wybraniu tylko jednego filmu)
    '-'                 - usuń znaleziony film
    S / SZUKAJ          - menu szukania filmu
    'ENTER' / MENU      - menu główne
    EXIT                - wyjście z programu
    `))
}
function pomocEdycja() { // POMOC EDYCJI FILMU
    console.log(colors.green(`
    Można edytować film.

    KOMENDY W MENU EDYCJI:

    'ENTER'             - wyjście z edycji

    M / MENU            - menu główne
    W / FILMY           - menu wszystkich filmów
    N / NOWE            - menu nowych filmów
    S / SZUKAJ          - menu szukania filmu
    E / EXIT            - wyjście z programu
    `))
}

// -------------- RÓŻNE -----------------------------
function nowyPL(arg) { // ODMIANA SŁOWA NOWY
    let nowy;
    switch(arg) {
        case 1 :
            nowy = 'nowy';
            break;
        case 2 :
        case 3 :
        case 4 :
            nowy = 'nowe';
            break;
        default :
            nowy = 'nowych';
            break;
    }
    return nowy;
}
function filmPL(arg) { // ODMIANA SŁOWA FILM
    let film;
    switch(arg) {
        case 1 :
            film = 'film';
            break;
        case 2 :
        case 3 :
        case 4 :
            film = 'filmy';
            break;
        default :
            film = 'filmów';
            break;
    }
    return film;
}
function autor() { // AUTOR
    odstęp();
    console.log(`Witaj w programie "LISTA FILMÓW.
    data produkcji: 02 stycznia 2021
    wersja programu: 1.0
    autor: Piotr Prajz
    `)
}
function odstęp() { // ODSTĘP
    console.log('\n_____________________________________\n');
}
function odstępMały() { // MNIEJSZY ODSTĘP
    console.log('_____________________________________\n');
}
function start() { // START PROGRAMU
    var gatunek = []; // tabica gatunków filmów
    console.clear();
    var powitanie = ('\nWitaj w programie "LISTA FILMÓW"\nWpisz H / HELP aby uzyskać pomoc.\n\n');
    var wskaźnik; // ile filmów na stronie (4)
    var next;   // następna strona z danymi - znak '' (sam enter)
    var strona; // która strona z danymi
    var stronaMax;  // maksymalny numer strony z danymi (dane prezentowane po 4)
    var ileNowychFilmów = 0; // ile nowych filmów znaleziono
    //var pytanieP,pytanieF;   // zmienne pytanie do jednego z UI
    var wybranyFilm;    // jeden tytuł z memoryFilm
    var nrPola; // który nr pola do edycji. używany w funkcji edycji
    var menuInfo;   // który obraz menu jest używany
    var krok; //kolejne kroki przy dodawaniu nowego filmu
    
    console.log(colors.blue(powitanie));
    obrazMenuGłówne();
    userInput();
}
function wyjście() { // WYJŚCIE Z PROGRAMU
    console.clear();
    process.exit();
}
function gatunki() { // WYSZUKANIE GATUNKÓW FILMÓW W BAZIE
    let było;

    for (i=0; i<data.length; i++) {
        if ((data[i].Type != undefined) && (data[i].Type != '')) {
            było = false
            if (i==0){
                gatunek = [data[i].Type];
            }
            for (j=0; j<gatunek.length; j++) {
                if (data[i].Type == gatunek[j]) {
                    było = true;
                }
            }
            if (było == false) {
                gatunek.push(data[i].Type);
            } 
        }
    }
}
function gatunkiInfo() { // INFORMACJA JAKIE SĄ GATUNKI FILMÓW W BAZIE
    gatunki();
    odstęp();
    console.log('Gatunki filmów:\n')

    let max = (gatunek.length - 1);
    for (i=0; i<max; i+=5) {
        if ((gatunek[i+0] == undefined) || (gatunek[i+0] == '')) {
            gatunek[i+0] = '';}
        else gatunek[i+0] = gatunek[i+0] + ', ';
        if ((gatunek[i+1] == undefined) || (gatunek[i+1] == '')) {
            gatunek[i+1] = '';}
        else gatunek[i+1] = gatunek[i+1] + ', ';
        if ((gatunek[i+2] == undefined) || (gatunek[i+2] == '')) {
            gatunek[i+2] = '';}
        else gatunek[i+2] = gatunek[i+2] + ', ';
        if ((gatunek[i+3] == undefined) || (gatunek[i+3] == '')) {
            gatunek[i+3] = '';}
        else gatunek[i+3] = gatunek[i+3] + ', ';
        if ((gatunek[i+4] == undefined) || (gatunek[i+4] == '')) {
            gatunek[i+4] = '';}
        else gatunek[i+4] = gatunek[i+4] + ', ';
        if ((gatunek[i+5] == undefined) || (gatunek[i+5] == '')) {
            gatunek[i+5] = '';}
        else gatunek[i+5] = gatunek[i+5] + ', ';
            
        console.log(gatunek[i],gatunek[i+1],gatunek[i+2],gatunek[i+3],gatunek[i+4],gatunek[i+5]);
    }
    console.log('\n');
}
function gatunkiInfoMini() { // INFORMACJA JAKIE SĄ GATUNKI FILMÓW W BAZIE
    gatunki();
    //let max = i;
    let max = (gatunek.length - 1); //Xnowe
    for (i=0; i<max; i+=5) {
        if ((gatunek[i+0] == undefined) || (gatunek[i+0] == '')) {
            gatunek[i+0] = '';}
        else gatunek[i+0] = gatunek[i+0] + ', ';
        if ((gatunek[i+1] == undefined) || (gatunek[i+1] == '')) {
            gatunek[i+1] = '';}
        else gatunek[i+1] = gatunek[i+1] + ', ';
        if ((gatunek[i+2] == undefined) || (gatunek[i+2] == '')) {
            gatunek[i+2] = '';}
        else gatunek[i+2] = gatunek[i+2] + ', ';
        if ((gatunek[i+3] == undefined) || (gatunek[i+3] == '')) {
            gatunek[i+3] = '';}
        else gatunek[i+3] = gatunek[i+3] + ', ';
        if ((gatunek[i+4] == undefined) || (gatunek[i+4] == '')) {
            gatunek[i+4] = '';}
        else gatunek[i+4] = gatunek[i+4] + ', ';
        if ((gatunek[i+5] == undefined) || (gatunek[i+5] == '')) {
            gatunek[i+5] = '';}
        else gatunek[i+5] = gatunek[i+5] + ', ';
            
        console.log('          ',gatunek[i],gatunek[i+1],gatunek[i+2],gatunek[i+3],gatunek[i+4],gatunek[i+5]);
    }
}

// -------------- EXCEL -----------------------------
function dodajFilm(arg) { // DODAJE NOWY FILM
    let potwierdzenie;
    let err = false;
    let err2;
    let tytuł, tytułArg;
    menuInfo = 0;
    
    switch (krok) {
        case 0 :
            pytanieP = '\nTytuł filmu: ';
            newData = data;
            krok++;
            userInputDodajFilm();
            potwierdzenie = false; // potwierdzenie pozwala na zapis filmu
            break;
        case 1 : // tytuł
            if (arg != '') {
                tytułArg = arg.toLocaleLowerCase();
                for (i=0; i<newData.length; i++) {
                    tytuł = newData[i].Title.toLocaleLowerCase();
                    if (tytułArg == tytuł) {
                        err = true;
                    }
                }
                if (err == false) {
                    newMovie.Title = arg;
                    krok++;
                    pytanieP = 'Ocena filmu: ';
                    }
            }
            else {
            console.log(colors.red('\nTytuł nie może być pusty!'));
            }
            if (err == true) console.log(colors.red('\nFilm już istnieje w bazie.'));
            userInputDodajFilm();
            break;
        case 2 : // ocena
        err2 = false;
            if ((isNaN(arg) == false) || (arg = '')) {
                    if (arg < 0 ) {
                        arg = '0';
                        err2 = true;
                    }
                    if (arg > 10) {
                        arg = '10';
                        err2 = true;
                    }
                newMovie.Stars = arg;
                krok++;
                pytanieP = 'Opis filmu: '; //gatunek / reżyser / aktorzy
            }
            else {
                console.log(colors.red('\nOcena może być liczbą lub zostać pusta.\n'));
            }
            if (err2 == true) console.log(colors.red('\nZmieniono ocenę, aby mieściła się w zakresie 0 - 10\n'));
            userInputDodajFilm();
            break;
        case 3 : // opis
            newMovie.Description = arg;
            krok++;
            console.log('Gatunki filmów w bazie:')
            gatunkiInfoMini();
            pytanieP = 'Gatunek filmu: ';
            userInputDodajFilm();
            break;
        case 4 : // gatunek
            newMovie.Type = arg;
            krok++;
            pytanieP = 'Reżyser: ';
            userInputDodajFilm();
            break;
        case 5 : // reżyser
            newMovie.Director = arg;
            krok++;
            pytanieP = 'Aktorzy: ';
            userInputDodajFilm();
            break;
        case 6 : // aktorzy (TABLICA)
            newMovie.Actors = arg;
            krok++;
            pytanieP = `\nWybierz : " T " aby zapisać film. " N " aby anulować, " E " aby edytować. --> `
            userInputDodajFilm();
            break;
        case 7 :
            if (arg == 't'){
                potwierdzenie = true;
                if (potwierdzenie == true) {
                    newData.push(newMovie);
                    zapis(newData);
                    console.clear();
                    obrazMenuGłówne();
                    console.log ('\nFilm dodany.')
                    userInput();
                }
            }
            else if (arg == 'n'){
                potwierdzenie = false;
                console.clear();
                obrazMenuGłówne();
                console.log('\nPrzerwano dodawanie filmu.');
                userInput();
            }
            else if (arg == 'e'){
                potwierdzenie = true;
                if (potwierdzenie == true) {
                    newData.push(newMovie);
                    zapis(newData);
                    console.log ('Edycja filmu:')
                    memoryFilm = [data.length-1];
                    if (zezwolenie() == true) {
                        newData = data;
                        menuInfo = 0;
                        console.clear();
                        obrazMenuGłówne();
                        odstęp();
                        obrazEdycja(wybranyFilm);
                        userInputEdycja();
                    }
                }
            }
            else {
                console.log(`Błędne polecenie, wpisz HELP, aby uzyskać pomoc.`);
                userInputDodajFilm();
            }
            // wyświetlenie danych filmu i możliwość wyboru T/N/E / edycja (zmianna wybranyFilm (memoryFilm.length))
    }
}
function usuńFilm(nr) { // USUNIĘCIE FILMU
    let newData = data;

    newData.splice(nr, 1);
    zapis(newData);
    console.log('Film usunięty.');
}
function edycjaPole(arg) {
    let err1 = false;
    let err2 = false;
    let err3 = false;

    switch (nrPola) {
        case 1 : // tytuł
            if (arg != '') {
                let tytułArg = arg.toLocaleLowerCase();
                for (i=0; i<newData.length; i++) {
                    let tytuł = newData[i].Title.toLocaleLowerCase();
                    if (tytułArg == tytuł) {
                        err3 = true;
                    }
                }
                if (err3 == false) {
                    newData[wybranyFilm].Title = arg;
                }
            }
            else {
                err1 = true;
            }
            break;
        case 2 : // ocena
            if (isNaN(arg) == false) {
                if (arg < 0 ) {
                    arg = '0';
                    err2 = true;
                }
                if (arg > 10) {
                    arg = '10';
                    err2 = true;
                }
                newData[wybranyFilm].Stars = arg;
            }
            else err2 = true;
            break;
        case 3 : // opis
            newData[wybranyFilm].Description = arg;
            break;
        case 4 : // gatunek
            if (arg != 's') {
            newData[wybranyFilm].Type = arg;
            }
            break;
        case 5 : // reżyser
            newData[wybranyFilm].Director = arg;
            break;
        case 6 : // aktor
            newData[wybranyFilm].Actors = arg;
            break;
    }

    zapis(newData);
    odstęp();
    console.clear();
    switch(menuInfo) {
        case 0 :
            obrazMenuGłówne();
            break
        case 1 :
            obrazMenuSzczegółyFilm();
            break;
        case 2 :
            obrazMenuSzczegółyNoweFilmy();
            break;
        case 31 :
            obrazMenuSzukanieLitera();
            break;
        case 32 :
            obrazMenuSzukanieOcena();
            break;
        case 33 :
            obrazMenuSzukanieGatunek();
            break;
        case 34 :
            obrazMenuSzukanieDowolne();
            break;
    }
    odstęp();
    if (err1 == true) console.log(colors.red('Tytuł nie może być pusty!\n'));
    if (err2 == true) console.log(colors.red('Zakres ocen 0 - 10\n'));
    if (err3 == true) console.log(colors.red('Film już istnieje w bazie.\n'));
    obrazEdycja(wybranyFilm);
    userInputEdycja();
}
function zezwolenie() { // ZEZWOLENIE NA EDYCJĘ LUB USUNIĘCIE
    if (memoryFilm.length == 1) {
        wybranyFilm = memoryFilm[0];
        return true;
    }
    else {
        //console.log('Wybierz tylko jeden film!');
        return false;
    }
}
function zapis(dane) {
    var plikNew = xlsx.utils.book_new(); // nowy workbook

    wsNew = xlsx.utils.json_to_sheet(dane); // nowy worksheet
    xlsx.utils.book_append_sheet(plikNew,wsNew); // dołączenie arkusza do excela
    xlsx.writeFile(plikNew,'baza filmów.xlsx'); // zapisanie pliku xlsx
}
function usuńWiele(arg) {
    let usuwaneFilmy = arg;
    let nr; // numer usuwanego filmu
    let newData = data;

    for (i=0; i<usuwaneFilmy.length; i++) {
        nr = usuwaneFilmy[i];
        nr -= i;
        newData = data;
        newData.splice(nr, 1);
    }
    zapis(newData);
    console.clear();
    obrazMenuGłówne();
    console.log('\nFilmy usunięte.');
    userInput();
}