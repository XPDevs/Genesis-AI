#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>
#include <unistd.h>

#define XOR_KEY 0xAA
#define MAX_INPUT 1024
#define MAX_RESPONSES 4096
#define MAX_MATCHES 50

typedef struct {
    char* keyword;
    char* response;
} ResponsePair;

ResponsePair database[MAX_RESPONSES];
int database_count = 0;

// Typewriter effect (30ms)
void typewriter(const char* text) {
    printf("AI: ");
    for (int i = 0; text[i] != '\0'; i++) {
        putchar(text[i]);
        fflush(stdout);
        usleep(30000); 
    }
    printf("\n");
}

// Placeholder replacement logic
char* process_placeholders(const char* text) {
    time_t t = time(NULL);
    struct tm *tm = localtime(&t);
    char date_str[11], time_str[6], year_str[5], day_str[20], tomorrow_str[11];
    
    strftime(date_str, 11, "%d/%m/%Y", tm);
    strftime(time_str, 6, "%H:%M", tm);
    strftime(year_str, 5, "%Y", tm);
    strftime(day_str, 20, "%A", tm);

    time_t tomorrow_t = t + (24 * 60 * 60);
    struct tm *tm_tomorrow = localtime(&tomorrow_t);
    strftime(tomorrow_str, 11, "%d/%m/%Y", tm_tomorrow);

    char* result = strdup(text);
    const char* tags[] = {"%DATE%", "%TIME%", "%YEAR%", "%DAY%", "%TOMORROW%"};
    const char* vals[] = {date_str, time_str, year_str, day_str, tomorrow_str};

    for(int j = 0; j < 5; j++) {
        char* temp;
        while ((temp = strstr(result, tags[j]))) {
            char* new_res = malloc(strlen(result) + strlen(vals[j]) + 1);
            int pos = temp - result;
            strncpy(new_res, result, pos);
            new_res[pos] = '\0';
            strcat(new_res, vals[j]);
            strcat(new_res, result + pos + strlen(tags[j]));
            free(result);
            result = new_res;
        }
    }
    return result;
}

void find_responses(char* input) {
    // 1. Show Thinking...
    printf("Thinking...");
    fflush(stdout);
    usleep(1500000); // 1.5s delay

    // 2. Clear the line (\r moves cursor to start, \033[K clears to end)
    printf("\r\033[K"); 
    fflush(stdout);

    char lower_input[MAX_INPUT];
    for(int i = 0; input[i]; i++) lower_input[i] = tolower(input[i]);
    lower_input[strlen(input)] = '\0';

    char* matched_responses[MAX_MATCHES];
    int match_count = 0;

    // 3. Dynamic Matching: Check if ANY keyword from the modal is in the input sentence
    for (int i = 0; i < database_count; i++) {
        char lower_key[256];
        int k;
        for(k = 0; database[i].keyword[k]; k++) lower_key[k] = tolower(database[i].keyword[k]);
        lower_key[k] = '\0';

        // Partial match logic: "gps" is found inside "why was the gps made"
        if (strstr(lower_input, lower_key)) {
            int duplicate = 0;
            for(int m = 0; m < match_count; m++) {
                if(strcmp(matched_responses[m], database[i].response) == 0) duplicate = 1;
            }
            if (!duplicate && match_count < MAX_MATCHES) {
                matched_responses[match_count++] = database[i].response;
            }
        }
    }

    if (match_count == 0) {
        typewriter("I can't find a direct response for that, but I'm learning!");
    } else {
        // 4. Grammar Join logic
        char combined[8192] = "";
        for (int i = 0; i < match_count; i++) {
            strcat(combined, matched_responses[i]);
            if (i < match_count - 2) strcat(combined, ", ");
            else if (i == match_count - 2) strcat(combined, " and ");
        }
        char* processed = process_placeholders(combined);
        typewriter(processed);
        free(processed);
    }
}

// GNIS Binary Loader
void load_binary_modal(const char* filename) {
    FILE* file = fopen(filename, "rb");
    if (!file) { perror("Modal error"); exit(1); }
    fseek(file, 0, SEEK_END);
    long size = ftell(file);
    fseek(file, 0, SEEK_SET);
    unsigned char* buffer = malloc(size);
    fread(buffer, 1, size, file);
    fclose(file);

    if (memcmp(buffer, "GNIS", 4) != 0) { printf("Invalid Genesis format.\n"); exit(1); }

    char* current_key = NULL;
    int i = 4;
    while (i < size && database_count < MAX_RESPONSES) {
        if (buffer[i] == 0x07) {
            i++; int start = i;
            while (i < size && buffer[i] != 0x00) i++;
            int len = i - start;
            char* decoded = malloc(len + 1);
            for (int j = 0; j < len; j++) decoded[j] = buffer[start + j] ^ XOR_KEY;
            decoded[len] = '\0';
            if (current_key == NULL) current_key = decoded;
            else {
                database[database_count].keyword = current_key;
                database[database_count].response = decoded;
                database_count++;
                current_key = NULL;
            }
        }
        i++;
    }
    free(buffer);
    printf("Genesis Core: %d topics loaded.\n", database_count);
}

int main(int argc, char* argv[]) {
    if (argc < 2) { printf("Usage: ./program <modal.bin>\n"); return 1; }
    load_binary_modal(argv[1]);
    char input[MAX_INPUT];
    while (1) {
        printf("> ");
        if (!fgets(input, MAX_INPUT, stdin)) break;
        input[strcspn(input, "\n")] = 0;
        if (strlen(input) == 0) continue;
        if (strcmp(input, "exit") == 0) break;
        find_responses(input);
    }
    return 0;
}
